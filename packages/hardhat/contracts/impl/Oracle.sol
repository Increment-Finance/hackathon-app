// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Storage} from "./Storage.sol";

/// @title Returns chainlink prices for reserve tokens
/// @notice Requires chainlink contract at address (works for kovan, rinkeby, mainnet (forking))
/// @dev Change address for deployment

contract Oracle is Storage {
    /// @notice Inititates assets and their price oracles
    /// @param assets Address of reserve tokens
    /// @param oracles Price oracle of reserve tokens
    /// @param _euroOracleAddress EUR/USD oracle address
    constructor(
        address[] memory assets,
        address[] memory oracles,
        address _euroOracleAddress
    ) {
        _setAssetsOracles(assets, oracles);
        euroOracle = AggregatorV3Interface(_euroOracleAddress);
    }

    function _setAssetsOracles(
        address[] memory assets,
        address[] memory oracles
    ) internal {
        require(
            assets.length == oracles.length,
            "Number of assets and oracles not equal"
        );
        for (uint256 i = 0; i < assets.length; i++) {
            _TOKENS_.push(assets[i]);
            assetOracles[assets[i]] = AggregatorV3Interface(oracles[i]);
        }
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
