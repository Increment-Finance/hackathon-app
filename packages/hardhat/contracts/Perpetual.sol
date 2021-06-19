// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@aave/protocol-v2/contracts/interfaces/IAToken.sol";
import "./PriceConsumerV3.sol";
import "./Reserve.sol";
import "./vAMM.sol";
import "hardhat/console.sol";

/// @title A perpetual contract w/ aTokens as collateral
/// @author Markus Schick
/// @notice You can only buy one type of perpetual and only use USDC as reserve

/// toDO:
// USDC reserve
// aUSDC (as reserve)
// implement minting/redeeming process (vTokens)
// add funding rate payments (TWAP, looping, ..)
// many leverage factors
// add liquidations

// add aETH supports
// add borrow money from Aave

contract Perpetual is PriceConsumerV3, Reserve, vAMM {
    using SafeERC20 for IERC20;

    /************************* state *************************/

    /// Leverage factor
    /// @dev // fix leverage to x10 for now

    constructor(
        uint256 _quoteAssetReserve,
        uint256 _baseAssetReserve,
        uint256 _leverage
    )
        PriceConsumerV3()
        vAMM(_quoteAssetReserve, _baseAssetReserve, _leverage)
    {}
}
