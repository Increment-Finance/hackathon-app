// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {Storage} from "./Storage.sol";
import {ILendingPool} from "../interfaces/InterfaceAave/lendingPool/ILendingPool.sol";

import "hardhat/console.sol";

/// @dev Returns information about the market state and user balances

contract Getter is Storage {
    /************************* GLOBAL VIEWS *************************/
    /// @notice Returns address of reserve tokens
    function getReserveAssets() public view returns (address[] memory) {
        return _TOKENS_;
    }

    /// @notice Returns information about the virtual Automated Market Maker (vAMM)
    /// @return pool struct has properties vEUR, vUSD, totalAssetReserve (x*y=k) and price
    function getPoolInfo() public view returns (PerpetualTypes.Pool memory) {
        return pool;
    }

    function getQuoteAssetOracle() public view returns (address) {
        return quoteAssetOracle;
    }

    function getAssetOracle(address _asset) public view returns (address) {
        return assetOracles[_asset];
    }

    /// @notice Gets an asset price by oracle address
    /// @param _oracleAddress The address of the chainlink oracle
    /// @dev fallBackPrice
    function getAssetPrice(address _oracleAddress)
        public
        view
        returns (uint256)
    {
        (, int256 price, , uint256 timeStamp, ) = AggregatorV3Interface(
            _oracleAddress
        ).latestRoundData();
        // If the round is not complete yet, timestamp is 0
        require(timeStamp > 0, "Round not complete");
        require(price > 0, "Integer conversion failed");
        return uint256(price);
    }

    /// @notice Gets an asset price by token address
    /// @param _tokenAddress The address of the chainlink oracle
    function getAssetPriceByTokenAddress(address _tokenAddress)
        public
        view
        returns (uint256)
    {
        return getAssetPrice(getAssetOracle(_tokenAddress));
    }

    /************************* USER VIEWS *************************/

    /// @notice Returns user balance of a given reserve tokens
    /// @param account user address
    /// @param _token token address
    function getReserveBalance(address account, address _token)
        public
        view
        returns (uint256)
    {
        return balances[account].userReserve[_token];
    }

    /// @notice Returns user long balance
    /// @param account user address
    function getLongBalance(address account) public view returns (uint256) {
        return balances[account].QuoteLong;
    }

    /// @notice Returns user short balance
    /// @param account user address
    function getShortBalance(address account) public view returns (uint256) {
        return balances[account].QuoteShort;
    }

    /// @notice Returns user USD notional
    /// @param account user address
    function getUserNotional(address account) public view returns (uint256) {
        return balances[account].usdNotional;
    }

    /// @notice Returns reserve value of a given trader
    /// @dev Ignore ETH value for now
    function getPortfolioValue(address account) public view returns (uint256) {
        uint256 portfolioValue;
        for (uint256 i = 0; i < _TOKENS_.length; i++) {
            address tokenAddress = _TOKENS_[i];
            portfolioValue += getAssetValue(account, tokenAddress);
        }
        return portfolioValue;
    }

    // @notice Calculates the value of token for user
    function getAssetValue(address account, address token)
        public
        view
        returns (uint256)
    {
        address oracleAddress = getAssetOracle(token);

        uint256 tokenValue;
        if (isAaveToken[token]) {
            tokenValue =
                (scaledBalanceToBalance(
                    getReserveBalance(account, token),
                    token
                ) * getAssetPrice(oracleAddress)) /
                10**8;
        } else {
            tokenValue =
                (getReserveBalance(account, token) *
                    getAssetPrice(oracleAddress)) /
                10**8;
        }

        return tokenValue;
    }

    /// @notice Computes the unrealized PnL
    /// @param account Address of user
    /// @return unrealized PnL
    function getUnrealizedPnL(address account)
        public
        view
        returns (PerpetualTypes.Int memory)
    {
        uint256 notionalAmount = getUserNotional(account);
        uint256 boughtAmount = getLongBalance(account) +
            getShortBalance(account);
        uint256 simplifiedSellAmount = (boughtAmount * pool.price) / 10**18;

        PerpetualTypes.Int memory unrealizedPnL;
        if (simplifiedSellAmount >= notionalAmount) {
            unrealizedPnL.isPositive = true;
            unrealizedPnL.value = simplifiedSellAmount - notionalAmount;
        } else {
            unrealizedPnL.isPositive = false;
            unrealizedPnL.value = notionalAmount - simplifiedSellAmount;
        }
        return unrealizedPnL;
    }

    /// @notice Returns information about the margin ratio of a account
    /// @param account Address of account
    /// @return Margin ratio of account w/ 18 decimals
    function getUserMarginRatio(address account) public view returns (uint256) {
        return
            _marginRatio(
                getPortfolioValue(account),
                getUnrealizedPnL(account),
                getUserNotional(account)
            );
    }

    function _marginRatio(
        uint256 margin,
        PerpetualTypes.Int memory unrealizedPnL,
        uint256 notionalValue
    ) internal pure returns (uint256) {
        //console.log("Margin is", margin);
        //console.log("unrealizedPnL is", unrealizedPnL);
        //console.log("notionalValue is", notionalValue);
        uint256 marginRatio;
        if (notionalValue > 0) {
            if (unrealizedPnL.isPositive) {
                marginRatio =
                    ((margin + unrealizedPnL.value) * 10**18) /
                    notionalValue;
            } else {
                marginRatio =
                    ((margin + unrealizedPnL.value) * 10**18) /
                    notionalValue;
            }
        }
        return marginRatio;
    }

    /************************* Aave helpers *************************/
    function scaledBalanceToBalance(uint256 amount, address token)
        internal
        view
        returns (uint256)
    {
        ILendingPool lendingpool = ILendingPool(
            lendingPoolAddressesProvider.getLendingPool()
        );
        uint256 currentIndex = lendingpool.getReserveNormalizedIncome(
            aaveReserve[token]
        );
        return (amount * currentIndex) / (10**27);
    }

    function balanceToScaledBalance(uint256 amount, address token)
        internal
        view
        returns (uint256)
    {
        ILendingPool lendingpool = ILendingPool(
            lendingPoolAddressesProvider.getLendingPool()
        );
        uint256 currentIndex = lendingpool.getReserveNormalizedIncome(
            aaveReserve[token]
        );
        return (amount * (10**27)) / currentIndex;
    }

    /// @notice Check if user leverage allows operation
    function _convertDollarToAssets(uint256 _amount, address _redeemAsset)
        internal
        view
        returns (uint256)
    {
        if (isAaveToken[_redeemAsset]) {
            _amount = balanceToScaledBalance(_amount, _redeemAsset);
        }
        return (_amount * getAssetPriceByTokenAddress(_redeemAsset)) / 10**8;
    }

    /************************* Funding grate *************************/
    function getVAMMsnapshots(uint256 _id)
        public
        view
        returns (PerpetualTypes.Price memory)
    {
        return prices[_id];
    }

    function getFundingRate()
        public
        view
        returns (PerpetualTypes.Index memory)
    {
        return global_index;
    }
}
