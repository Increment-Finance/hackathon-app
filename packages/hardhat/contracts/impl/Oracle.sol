// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import {ILendingPoolAddressesProvider} from "../interfaces/InterfaceAave/lendingPool/ILendingPoolAddressesProvider.sol";
import {Storage} from "./Storage.sol";

/// @notice Initiates address of chainlink price oracles

contract Oracle is Storage, Ownable {
    /// @notice Inititates assets and their price oracles
    /// @param _quoteAssetOracleAddress JPY/USD oracle address
    /// @param _lendingPoolAddressProvider Aave lending pool provide
    constructor(
        address _quoteAssetOracleAddress,
        address _lendingPoolAddressProvider
    ) {
        lendingPoolAddressesProvider = ILendingPoolAddressesProvider(
            _lendingPoolAddressProvider
        );
        quoteAssetOracle = _quoteAssetOracleAddress;
    }

    /// @notice Set a new asset eligible as reserve
    /// @param  _asset Address of ERC20
    /// @param  _priceOracle Chainlink Oracle
    /// @param  _isAToken bool for aTokens
    /// @param  _aaveReserve underlying Aave token (aUSDC =>USDC)

    function setReserveToken(
        address _asset,
        address _priceOracle,
        bool _isAToken,
        address _aaveReserve
    ) public onlyOwner {
        _TOKENS_.push(_asset);
        assetOracles[_asset] = _priceOracle;
        isAaveToken[_asset] = _isAToken;
        if (_isAToken) {
            require(_aaveReserve != address(0), "Set underlying asset");
            aaveReserve[_asset] = _aaveReserve;
        }
    }
}
