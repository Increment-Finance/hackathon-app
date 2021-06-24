// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Storage} from "./Storage.sol";

/// @title Returns chainlink prices for reserve tokens
/// @notice Requires chainlink contract at address (works for kovan, rinkeby, mainnet (forking))

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
}
