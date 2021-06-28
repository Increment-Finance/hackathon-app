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

contract MinterRedeemer is Getter, vAMM {
    using SafeERC20 for IERC20;

    constructor(uint256 _quoteAssetReserve, uint256 _baseAssetReserve) {
        pool.vEUR = _quoteAssetReserve;
        pool.vUSD = _baseAssetReserve;
        pool.totalAssetReserve = _quoteAssetReserve * _baseAssetReserve;
        pool.price = (_baseAssetReserve * 10**18) / _quoteAssetReserve;
    }

    /************************* events *************************/

    event buyEURUSDlong(
        uint256 notional,
        address indexed user,
        uint256 eurlong
    );
    event buyEURUSDshort(
        uint256 notional,
        address indexed user,
        uint256 eurshort
    );

    event sellEURUSDlong(
        uint256 eurlong,
        address indexed user,
        address indexed reserve
    );
    event sellEURUSDshort(
        uint256 eurshort,
        address indexed user,
        address indexed reserve
    );

    /************************* functions *************************/

    /// @notice Check if user leverage allows operation
    function leverageIsFine(address account, uint256 _amount)
        internal
        view
        returns (bool)
    {
        uint256 newMarginRatio = _marginRatio(
            getPortfolioValue(account),
            getUnrealizedPnL(account),
            getUserNotional(account) + _amount
        );
        //console.log("newMarginRatio is: ", newMarginRatio);
        uint256 maxInitialMargin = 10**17; // 10 %
        return newMarginRatio >= maxInitialMargin;
    }

    /* go long EURUSD */
    /// @notice Wrapper around MintLongEUR to simplifiy interaction with front-end
    /// @param _leverage Initial Leverage factor of position
    function MintLongWithLeverage(uint8 _leverage) public returns (uint256) {
        require(_leverage <= 10, "Maximum initial leverage is 10");
        uint256 notionalAmount = getPortfolioValue(msg.sender) * _leverage;
        return MintLongEUR(notionalAmount);
    }

    /// @notice Buys long EURUSD derivatives
    /// @param _amount Amount of EURUSD tokens to be bought
    /// @dev No checks are done if bought amount exceeds allowance
    function MintLongEUR(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].EURUSDshort == 0,
            "User can not go long w/ an open short position"
        );
        require(
            leverageIsFine(msg.sender, _amount),
            "Leverage factor is too high"
        );

        uint256 EURUSDlongBought = _mintVUSD(_amount);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].EURUSDlong += EURUSDlongBought;

        emit buyEURUSDlong(_amount, msg.sender, EURUSDlongBought);
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
        //console.log("Amount to be redeemed", _amount);
        //console.log("Amount currently held", balances[msg.sender].EURUSDlong);
        require(_amount > 0, "Should redeem amount larger than 0");
        require(
            balances[msg.sender].EURUSDlong >= _amount,
            "USDC balances are too low"
        );
        balances[msg.sender].EURUSDlong -= _amount;

        uint256 EURUSDlongSold = _mintVEUR(_amount);
        uint256 EURUSDlongBought = balances[msg.sender].usdNotional;
        //console.log("EURUSDlongBought is", EURUSDlongBought);
        //console.log("EURUSDlongSold is", EURUSDlongSold);

        if (EURUSDlongSold >= EURUSDlongBought) {
            uint256 amountOwed = (EURUSDlongSold - EURUSDlongBought);
            balances[msg.sender].userReserve[_redeemAsset] += amountOwed;
        } else if (EURUSDlongSold < EURUSDlongBought) {
            uint256 amountPayed = EURUSDlongBought - EURUSDlongSold;
            balances[msg.sender].userReserve[_redeemAsset] -= amountPayed;
        }
        emit sellEURUSDlong(_amount, msg.sender, _redeemAsset);
        return EURUSDlongSold;
    }

    /// @notice Wrapper around MintShortEUR to simplifiy interaction with front-end
    /// @param _leverage Initial Leverage factor of position
    function MintShortWithLeverage(uint8 _leverage) public returns (uint256) {
        require(_leverage <= 10, "Maximum initial leverage is 10");
        uint256 notionalAmount = getPortfolioValue(msg.sender) * _leverage;
        return MintShortEUR(notionalAmount);
    }

    /// @notice Buys short EURUSD derivatives
    /// @param _amount Amount of EURUSD tokens to be bought
    /// @dev No checks are done if bought amount exceeds allowance
    function MintShortEUR(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].EURUSDlong == 0,
            "User can not go long w/ an open short position"
        );
        require(
            leverageIsFine(msg.sender, _amount),
            "Leverage factor is too high"
        );
        uint256 EURUSDshortBought = _burnVUSD(_amount);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].EURUSDshort += EURUSDshortBought;
        //console.log("EURUSDshortBought is", EURUSDshortBought);
        emit buyEURUSDshort(_amount, msg.sender, EURUSDshortBought);
        return EURUSDshortBought;
    }

    /// @notice Redeems short EURUSD derivatives
    /// @param _amount Amount of EURUSD tokens to be redeemed
    /// @param _redeemAsset Assets used to settle account
    /// @dev The value of the redeemed tokens is not calculated from price oracles
    function RedeemShortEUR(uint256 _amount, address _redeemAsset)
        public
        returns (uint256)
    {
        require(_amount > 0, "Should redeem amount larger than 0");
        require(
            balances[msg.sender].EURUSDshort >= _amount,
            "USDC balances are too low"
        );

        balances[msg.sender].EURUSDshort -= _amount;

        uint256 EURUSDshortSold = _burnVEUR(_amount);
        uint256 EURUSDshortBought = balances[msg.sender].usdNotional;

        if (EURUSDshortSold >= EURUSDshortBought) {
            uint256 amountOwed = (EURUSDshortSold - EURUSDshortBought);
            balances[msg.sender].userReserve[_redeemAsset] += amountOwed;
        } else if (EURUSDshortSold < EURUSDshortBought) {
            uint256 amountPayed = (EURUSDshortBought - EURUSDshortSold);
            balances[msg.sender].userReserve[_redeemAsset] -= amountPayed;
        }
        emit sellEURUSDshort(_amount, msg.sender, _redeemAsset);
        return EURUSDshortSold;
    }
}
