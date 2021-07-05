// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {vAMM} from "./vAMM.sol";
import {Storage} from "./Storage.sol";
import {Settlement} from "./Settlement.sol";

import "hardhat/console.sol";

/// @notice Mints and redeems perpetual tokens

contract MinterRedeemer is Settlement, vAMM {
    using SafeERC20 for IERC20;

    constructor(uint256 _quoteAssetReserve, uint256 _baseAssetReserve) {
        pool.vQuote = _quoteAssetReserve;
        pool.vBase = _baseAssetReserve;
        pool.totalAssetReserve = _quoteAssetReserve * _baseAssetReserve;
        pool.price = (_baseAssetReserve * 10**18) / _quoteAssetReserve;
    }

    /************************* events *************************/

    event buyQuoteLong(
        uint256 notional,
        address indexed user,
        uint256 QuoteLong
    );

    event buyQuoteShort(
        uint256 notional,
        address indexed user,
        uint256 QuoteShort
    );

    event sellQuoteLong(
        uint256 quoteLong,
        address indexed user,
        address indexed reserve
    );
    event sellQuoteShort(
        uint256 quoteshort,
        address indexed user,
        address indexed reserve
    );

    /************************* functions *************************/

    /// @notice Check if user leverage allows operation
    function _leverageIsFine(address account, uint256 _amount)
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

    /* go long Quote */
    /// @notice Wrapper around MintLongQuote to simplifiy interaction with front-end
    /// @param _leverage Initial Leverage factor of position
    function MintLongWithLeverage(uint8 _leverage) public returns (uint256) {
        require(_leverage <= 10, "Maximum initial leverage is 10");
        uint256 notionalAmount = getPortfolioValue(msg.sender) * _leverage;
        return MintLongQuote(notionalAmount);
    }

    /// @notice Buys long Quote derivatives
    /// @param _amount Amount of Quote tokens to be bought
    /// @dev No checks are done if bought amount exceeds allowance
    function MintLongQuote(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].QuoteShort == 0,
            "User can not go long w/ an open short position"
        );
        require(
            balances[msg.sender].QuoteLong == 0,
            "User can not go long w/ an open long position"
        ); // since index would be recalculated
        require(
            _leverageIsFine(msg.sender, _amount),
            "Leverage factor is too high"
        );

        uint256 QuoteLongBought = _mintVBase(_amount);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].QuoteLong += QuoteLongBought;

        emit buyQuoteLong(_amount, msg.sender, QuoteLongBought);

        index[msg.sender] = global_index;
        return QuoteLongBought;
    }

    /// @notice Redeems long Quote derivatives
    /// @param _redeemAsset Assets used to settle account
    /// @dev The value of the redeemed tokens is not calculated from price oracles
    function RedeemLongQuote(address _redeemAsset) public returns (uint256) {
        uint256 _amount = balances[msg.sender].QuoteLong;
        //console.log("Amount to be redeemed", _amount);
        //console.log("Amount currently held", balances[msg.sender].QuoteLong);
        require(_amount > 0, "Should redeem amount larger than 0");
        require(
            balances[msg.sender].QuoteLong >= _amount,
            "USDC balances are too low"
        );
        balances[msg.sender].QuoteLong = 0;

        uint256 QuoteLongSold = _mintVQuote(_amount);
        uint256 QuoteLongBought = balances[msg.sender].usdNotional;
        //console.log("QuoteLongBought is", QuoteLongBought);
        //console.log("QuoteLongSold is", QuoteLongSold);

        if (QuoteLongSold >= QuoteLongBought) {
            uint256 dollarAmountOwed = (QuoteLongSold - QuoteLongBought);
            balances[msg.sender].userReserve[
                _redeemAsset
            ] += _convertDollarToAssets(dollarAmountOwed, _redeemAsset);
        } else if (QuoteLongSold < QuoteLongBought) {
            uint256 dollarAmountPayed = QuoteLongBought - QuoteLongSold;
            balances[msg.sender].userReserve[
                _redeemAsset
            ] -= _convertDollarToAssets(dollarAmountPayed, _redeemAsset);
        }
        settleAccount(msg.sender, _redeemAsset);
        balances[msg.sender].usdNotional = 0;
        emit sellQuoteLong(_amount, msg.sender, _redeemAsset);
        return QuoteLongSold;
    }

    /// @notice Wrapper around MintShortQuote to simplifiy interaction with front-end
    /// @param _leverage Initial Leverage factor of position
    function MintShortWithLeverage(uint8 _leverage) public returns (uint256) {
        require(_leverage <= 10, "Maximum initial leverage is 10");
        uint256 notionalAmount = getPortfolioValue(msg.sender) * _leverage;
        return MintShortQuote(notionalAmount);
    }

    /// @notice Buys short Quote derivatives
    /// @param _amount Amount of Quote tokens to be bought
    /// @dev No checks are done if bought amount exceeds allowance
    function MintShortQuote(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].QuoteLong == 0,
            "User can not go long w/ an open short position"
        );
        require(
            balances[msg.sender].QuoteShort == 0,
            "User can not go long w/ an open short position"
        ); // since index would be recalculated
        require(
            _leverageIsFine(msg.sender, _amount),
            "Leverage factor is too high"
        );
        uint256 QuoteShortBought = _burnVBase(_amount);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].QuoteShort += QuoteShortBought;
        //console.log("QuoteShortBought is", QuoteShortBought);
        emit buyQuoteShort(_amount, msg.sender, QuoteShortBought);
        index[msg.sender] = global_index;
        return QuoteShortBought;
    }

    /// @notice Redeems short Quote derivatives
    /// @param _redeemAsset Assets used to settle account
    /// @dev The value of the redeemed tokens is not calculated from price oracles
    function RedeemShortQuote(address _redeemAsset) public returns (uint256) {
        uint256 _amount = balances[msg.sender].QuoteShort;
        require(_amount > 0, "Should redeem amount larger than 0");
        require(
            balances[msg.sender].QuoteShort >= _amount,
            "USDC balances are too low"
        );

        balances[msg.sender].QuoteShort -= _amount;

        uint256 QuoteShortSold = _burnVQuote(_amount);
        uint256 QuoteShortBought = balances[msg.sender].usdNotional;

        if (QuoteShortSold >= QuoteShortBought) {
            uint256 dollarAmountOwed = (QuoteShortSold - QuoteShortBought);
            balances[msg.sender].userReserve[
                _redeemAsset
            ] += _convertDollarToAssets(dollarAmountOwed, _redeemAsset);
        } else if (QuoteShortSold < QuoteShortBought) {
            uint256 dollarAmountPayed = (QuoteShortBought - QuoteShortSold);
            balances[msg.sender].userReserve[
                _redeemAsset
            ] -= _convertDollarToAssets(dollarAmountPayed, _redeemAsset);
        }
        settleAccount(msg.sender, _redeemAsset);
        balances[msg.sender].usdNotional = 0;
        emit sellQuoteShort(_amount, msg.sender, _redeemAsset);
        return QuoteShortSold;
    }

    function settlePosition(
        address account,
        uint256 amountBought,
        uint256 amountSold
    ) internal {}
}
