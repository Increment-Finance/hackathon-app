// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {Storage} from "./Storage.sol";

contract Getter is Storage {
    /// @notice Returns user balance of a given reserve tokens
    /// @param _address user address
    /// @param _token token address
    function getUserBalance(address _address, address _token)
        public
        view
        returns (uint256)
    {
        return balances[_address].userReserve[_token];
    }

    /// @notice Returns address of reserve tokens
    function getReserveAssets() public view returns (address[] memory) {
        return _TOKENS_;
    }

    /// @notice Returns reserve value of a given trader
    /// @dev Ignore ETH value for now
    function getPortfolioValue(address _address) public view returns (uint256) {
        uint256 portfolioValue;
        for (uint256 i = 0; i < _TOKENS_.length; i++) {
            address tokenAddress = _TOKENS_[i];
            portfolioValue += balances[_address].userReserve[tokenAddress];
        }
        return portfolioValue;
    }

    /// @notice Returns information about the virtual Automated Market Maker (vAMM)
    /// @return pool struct has properties vEUR, vUSD, totalAssetReserve (x*y=k) and price
    function getPoolInfo() public view returns (PerpetualTypes.Pool memory) {
        return pool;
    }

    /// @notice Returns information about the margin ratio of a user
    /// @param user Address of user
    /// @return Margin ratio of user w/ 18 decimals
    function getMarginRatio(address user) public view returns (uint256) {
        return balances[user].margin;
    }

    /// @notice Gets an asset price by address
    /// @param asset The token address
    /// @param fallBackPrice Return Fallback if no oracle found
    /// @dev fallBackPrice can be used for local testing
    function getAssetPrice(address asset, uint256 fallBackPrice)
        public
        view
        returns (uint256)
    {
        AggregatorV3Interface oracle = assetOracles[asset];
        (, int256 price, , uint256 timeStamp, ) = AggregatorV3Interface(oracle)
        .latestRoundData();
        // If the round is not complete yet, timestamp is 0
        require(timeStamp > 0, "Round not complete");
        if (price > 0) {
            return uint256(price);
        } else {
            return uint256(fallBackPrice);
        }
    }
}
