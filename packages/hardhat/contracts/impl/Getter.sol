// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {Storage} from "./Storage.sol";

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

    function getEUROracle() public view returns (address) {
        return euroOracle;
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
        return balances[account].EURUSDlong;
    }

    /// @notice Returns user short balance
    /// @param account user address
    function getShortBalance(address account) public view returns (uint256) {
        return balances[account].EURUSDshort;
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
        uint256 tokenValue = getReserveBalance(account, token) *
            getAssetPrice(oracleAddress);
        return tokenValue;
    }

    /// @notice Computes the unrealized PnL
    /// @return unrealized PnL
    /// @dev to be implemented
    function getUnrealizedPnL() public pure returns (uint256) {
        return uint256(0);
    }

    /// @notice Returns information about the margin ratio of a account
    /// @param account Address of account
    /// @return Margin ratio of account w/ 18 decimals

    function getUserMarginRatio(address account) public view returns (uint256) {
        return
            _marginRatio(
                getPortfolioValue(account),
                getUnrealizedPnL(),
                getUserNotional(account)
            );
    }

    function _marginRatio(
        uint256 margin,
        uint256 unrealizedPnL,
        uint256 notionalValue
    ) internal pure returns (uint256) {
        //console.log("Margin is", margin);
        //console.log("unrealizedPnL is", unrealizedPnL);
        //console.log("notionalValue is", notionalValue);
        if (notionalValue == 0) {
            return 0;
        } else return ((margin + unrealizedPnL) * 10**18) / notionalValue;
    }
}
