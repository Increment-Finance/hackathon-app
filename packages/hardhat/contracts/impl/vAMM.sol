// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {Storage} from "./Storage.sol";

import "hardhat/console.sol";

/// @notice Implmements underlying vAMM logic

contract vAMM is Storage {
    /************************* events *************************/
    event NewReserves(
        uint256 vBase,
        uint256 vQuote,
        uint256 newPrice,
        uint256 blockNumber
    );

    /************************* functions *************************/

    /* mint vBase to go long euro */
    function _mintVBase(uint256 amount) internal returns (uint256) {
        uint256 vBasenew = pool.vBase + amount;
        uint256 vQuoteNew = pool.totalAssetReserve / vBasenew; // x = k / y
        uint256 buy = pool.vQuote - vQuoteNew;

        _updateBalances(vBasenew, vQuoteNew);

        return buy;
    }

    /* burn vBase to go short euro */
    function _burnVBase(uint256 amount) internal returns (uint256) {
        uint256 vBasenew = pool.vBase - amount;
        uint256 vQuoteNew = pool.totalAssetReserve / vBasenew; // x = k / y
        uint256 buy = vQuoteNew - pool.vQuote;

        //console.log("pool.totalAssetReserve is", pool.totalAssetReserve);
        //console.log("vQuoteNew is", vQuoteNew);
        //console.log("vBasenew is", vBasenew);
        //console.log("buy is", buy);

        _updateBalances(vBasenew, vQuoteNew);

        return buy;
    }

    /* mint vQuote to close long euro */
    function _mintVQuote(uint256 amount) internal returns (uint256) {
        uint256 vQuoteNew = pool.vQuote + amount;
        uint256 vBasenew = pool.totalAssetReserve / vQuoteNew; // x = k / y
        uint256 sell = pool.vBase - vBasenew;

        //console.log("pool.totalAssetReserve is", pool.totalAssetReserve);
        //console.log("vQuoteNew is", vQuoteNew);
        //console.log("vBasenew is", vBasenew);
        //console.log("sell is", sell);
        _updateBalances(vBasenew, vQuoteNew);

        return sell;
    }

    /* burn vQuote to close short euro */
    function _burnVQuote(uint256 amount) internal returns (uint256) {
        uint256 vQuoteNew = pool.vBase - amount;
        uint256 vBasenew = pool.totalAssetReserve / vQuoteNew; // x = k / y
        uint256 sell = vBasenew - pool.vBase;

        _updateBalances(vBasenew, vQuoteNew);

        return sell;
    }

    /* update reserve balances after buying/selling */
    function _updateBalances(uint256 _vBaseNew, uint256 _vQuoteNew) internal {
        uint256 newPrice = (_vBaseNew * 10**18) / _vQuoteNew;

        //console.log("vamm state before is", pool.price, pool.vBase, pool.vEUR);
        pool.price = newPrice;
        pool.vBase = _vBaseNew;
        pool.vQuote = _vQuoteNew;

        //console.log("vamm state after is", pool.price, pool.vBase, pool.vEUR);
        emit NewReserves(_vBaseNew, _vQuoteNew, newPrice, block.number);
    }
}
