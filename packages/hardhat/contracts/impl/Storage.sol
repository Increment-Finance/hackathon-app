// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";

import "hardhat/console.sol";

/// @notice Stores all contract states

contract Storage {
    // vAMM trading pool
    PerpetualTypes.Pool pool;

    // user position
    mapping(address => PerpetualTypes.UserPosition) balances;

    // reserve assets
    address[] public _TOKENS_;
    mapping(address => bool) isAaveToken; /// @dev later: used to scale balances

    // oracles
    address internal euroOracle;
    mapping(address => address) internal assetOracles;
}
