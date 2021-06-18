// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./PriceConsumerV3.sol";
import "hardhat/console.sol";

contract Perpetual is PriceConsumerV3 {
    IERC20 public USDC;
}
