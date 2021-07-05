// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {ILendingPoolAddressesProvider} from "../interfaces/InterfaceAave/lendingPool/ILendingPoolAddressesProvider.sol";

import "hardhat/console.sol";

/// @notice Stores all contract states

contract Storage {
    // vAMM trading pool
    PerpetualTypes.Pool public pool;

    // global index
    PerpetualTypes.Index public global_index;

    // user position
    mapping(address => PerpetualTypes.UserPosition) public balances;
    mapping(address => PerpetualTypes.Index) public index;

    // reserve assets
    address[] public _TOKENS_;

    // Aave integration
    ILendingPoolAddressesProvider lendingPoolAddressesProvider;
    mapping(address => address) aaveReserve;
    mapping(address => bool) isAaveToken;

    // oracles
    address internal quoteAssetOracle;
    mapping(address => address) internal assetOracles;

    // TWAP prices
    PerpetualTypes.Price[] internal prices;
    mapping(address => bool) internal isSettledAccount;
}
