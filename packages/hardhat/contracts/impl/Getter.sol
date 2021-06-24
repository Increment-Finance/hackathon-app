// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {Storage} from "./Storage.sol";

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

    /// @notice Gets an asset price by address
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

    /************************* USER VIEWS *************************/

    /// @notice Returns user balance of a given reserve tokens
    /// @param account user address
    /// @param _token token address
    function getUserBalance(address account, address _token)
        public
        view
        returns (uint256)
    {
        return balances[account].userReserve[_token];
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
            address oracleAddress = assetOracles[tokenAddress];
            portfolioValue +=
                getUserBalance(account, tokenAddress) *
                getAssetPrice(oracleAddress);
        }
        return portfolioValue;
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
                getAssetPrice(account),
                getUnrealizedPnL(),
                getUserNotional(account)
            );
    }

    function _marginRatio(
        uint256 margin,
        uint256 unrealizedPnL,
        uint256 notionalValue
    ) internal pure returns (uint256) {
        return ((margin + unrealizedPnL) * 10**18) / notionalValue;
    }
}
