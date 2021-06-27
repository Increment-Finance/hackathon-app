// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {Storage} from "./Storage.sol";

/// @notice Initiates address of chainlink price oracles

contract Oracle is Storage, Ownable {
    /// @notice Inititates assets and their price oracles
    /// @param assets Address of reserve tokens
    /// @param oracles Price oracle of reserve tokens
    /// @param _euroOracle EUR/USD oracle address
    constructor(
        address[] memory assets,
        address[] memory oracles,
        address _euroOracle
    ) {
        _setAssetsOracles(assets, oracles);
        euroOracle = _euroOracle;
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
            assetOracles[assets[i]] = oracles[i];
        }
    }

    function setReserveTokens(address[] memory assets, address[] memory oracles)
        public
        onlyOwner
    {
        _setAssetsOracles(assets, oracles);
    }
}
