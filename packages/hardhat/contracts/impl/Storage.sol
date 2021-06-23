// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../lib/PerpetualTypes.sol";
import "hardhat/console.sol";

/// @title A perpetual contract w/ aTokens as collateral
/// @author Markus Schick
/// @notice You can only buy one type of perpetual and only use USDC as reserve

contract Storage {
    /************************* state *************************/

    // vAMM trading pool
    PerpetualTypes.Pool pool;

    // user position
    mapping(address => PerpetualTypes.UserPosition) balances;

    // reserve assets
    address[] public _TOKENS_;
    mapping(address => bool) isAaveToken;

    // oracles
    AggregatorV3Interface internal euroOracle;
    mapping(address => AggregatorV3Interface) internal assetOracles;
}
