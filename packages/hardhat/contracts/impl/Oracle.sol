// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {Storage} from "./Storage.sol";

/// @notice Initiates address of chainlink price oracles

contract Oracle is Storage, Ownable {
    /// @notice Inititates assets and their price oracles
    /// @param _assets Address of reserve tokens
    /// @param _oracles Price oracle of reserve tokens
    /// @param _isAaveToken Reserve token is aToken
    /// @param _euroOracle EUR/USD oracle address
    constructor(
        address[] memory _assets,
        address[] memory _oracles,
        bool[] memory _isAaveToken,
        address _euroOracle
    ) {
        _setAssetsOracles(_assets, _oracles, _isAaveToken);
        euroOracle = _euroOracle;
    }

    function _setAssetsOracles(
        address[] memory _assets,
        address[] memory _oracles,
        bool[] memory _isAaveToken
    ) internal {
        require(
            _assets.length == _oracles.length,
            "Number of assets and oracles not equal"
        );
        for (uint256 i = 0; i < _assets.length; i++) {
            _TOKENS_.push(_assets[i]);
            assetOracles[_assets[i]] = _oracles[i];
            isAaveToken[_assets[i]] = _isAaveToken[i];
        }
    }

    function setReserveTokens(
        address[] memory _assets,
        address[] memory _oracles,
        bool[] memory _isAaveToken
    ) public onlyOwner {
        _setAssetsOracles(_assets, _oracles, _isAaveToken);
    }
}
