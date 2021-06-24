// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {vAMM} from "./vAMM.sol";
import {Storage} from "./Storage.sol";
import {Getter} from "./Getter.sol";

import "hardhat/console.sol";

/// @notice Mints and redeems perpetual tokens

contract MinterRedeemer is Storage, vAMM {
    using SafeERC20 for IERC20;

    constructor(uint256 _quoteAssetReserve, uint256 _baseAssetReserve) {
        pool.vEUR = _quoteAssetReserve;
        pool.vUSD = _baseAssetReserve;
        pool.totalAssetReserve = _quoteAssetReserve * _baseAssetReserve;
    }

    /************************* events *************************/

    event buyEURUSDlong(uint256, address indexed);
    event buyEURUSDshort(uint256, address indexed);

    event sellEURUSDlong(uint256, address indexed);
    event sellEURUSDshort(uint256, address indexed);

    /************************* functions *************************/

    /* go long EURUSD */

    /// @notice Check if user leverage allows operation
    function leverageIsFine() public pure returns (bool) {
        return true;
    }

    /// @notice Buys long EURUSD derivatives
    /// @param _amount Amount of EURUSD tokens to be bought
    /// @dev No checks are done if bought amount exceeds allowance
    function MintLongEUR(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].EURUSDshort == 0,
            "User can not go long w/ an open short position"
        );
        require(leverageIsFine(), "Leverage factor is too high");
        uint256 EURUSDlongBought = _mintVUSD(_amount, pool);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].EURUSDlong += EURUSDlongBought;

        emit buyEURUSDlong(_amount, msg.sender);
        return EURUSDlongBought;
    }

    /// @notice Redeems long EURUSD derivatives
    /// @param _amount Amount of EURUSD tokens to be redeemed
    /// @param _redeemAsset Assets used to settle account
    /// @dev The value of the redeemed tokens is not calculated from price oracles
    function RedeemLongEUR(uint256 _amount, address _redeemAsset)
        public
        returns (uint256)
    {
        require(
            balances[msg.sender].EURUSDlong >= _amount,
            "USDC balances are too low"
        );

        balances[msg.sender].EURUSDlong -= _amount;

        uint256 EURUSDlongSold = _mintVEUR(_amount, pool);
        uint256 EURUSDlongBought = balances[msg.sender].usdNotional;

        if (EURUSDlongSold >= EURUSDlongBought) {
            balances[msg.sender].userReserve[_redeemAsset] += (EURUSDlongSold -
                EURUSDlongBought);
        } else if (EURUSDlongSold < EURUSDlongBought) {
            balances[msg.sender].userReserve[
                _redeemAsset
            ] -= (EURUSDlongBought - EURUSDlongSold);
        }
        emit sellEURUSDlong(_amount, msg.sender);
        return EURUSDlongSold;
    }

    /// @notice Buys short EURUSD derivatives
    /// @param _amount Amount of EURUSD tokens to be bought
    /// @dev No checks are done if bought amount exceeds allowance
    function MintShortEUR(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].EURUSDlong == 0,
            "User can not go long w/ an open short position"
        );
        require(leverageIsFine(), "Leverage factor is too high");
        uint256 EURUSDshortBought = _burnVUSD(_amount, pool);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].EURUSDlong += EURUSDshortBought;

        emit buyEURUSDshort(_amount, msg.sender);
        return EURUSDshortBought;
    }

    /// @notice Redeems short EURUSD derivatives
    /// @param _amount Amount of EURUSD tokens to be redeemed
    /// @param _redeemAsset Assets used to settle account
    /// @dev The value of the redeemed tokens is not calculated from price oracles
    function RedeemshortEUR(uint256 _amount, address _redeemAsset)
        public
        returns (uint256)
    {
        require(
            balances[msg.sender].EURUSDshort >= _amount,
            "USDC balances are too low"
        );

        balances[msg.sender].EURUSDshort -= _amount;

        uint256 EURUSDshortSold = _burnVEUR(_amount, pool);
        uint256 EURUSDshortBought = balances[msg.sender].usdNotional;

        if (EURUSDshortSold >= EURUSDshortBought) {
            balances[msg.sender].userReserve[_redeemAsset] += (EURUSDshortSold -
                EURUSDshortBought);
        } else if (EURUSDshortSold < EURUSDshortBought) {
            balances[msg.sender].userReserve[
                _redeemAsset
            ] -= (EURUSDshortBought - EURUSDshortSold);
        }
        emit sellEURUSDshort(_amount, msg.sender);
        return EURUSDshortSold;
    }
}
