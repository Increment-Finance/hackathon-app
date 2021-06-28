// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {Storage} from "./Storage.sol";

import "hardhat/console.sol";

/// @notice Implmements underlying vAMM logic

contract vAMM is Storage {
    /************************* events *************************/
    event NewReserves(
        uint256 vUSD,
        uint256 vEUR,
        uint256 newPrice,
        uint256 blockNumber
    );

    /************************* functions *************************/

    /* mint VUSD to go long euro */
    function _mintVUSD(uint256 amount) internal returns (uint256) {
        uint256 vUSDnew = pool.vUSD + amount;
        uint256 vEURnew = pool.totalAssetReserve / vUSDnew; // x = k / y
        uint256 buy = pool.vEUR - vEURnew;

        _updateBalances(vUSDnew, vEURnew);

        return buy;
    }

    /* burn vUSD to go short euro */
    function _burnVUSD(uint256 amount) internal returns (uint256) {
        uint256 vUSDnew = pool.vUSD - amount;
        uint256 vEURnew = pool.totalAssetReserve / vUSDnew; // x = k / y
        uint256 buy = vEURnew - pool.vEUR;

        //console.log("pool.totalAssetReserve is", pool.totalAssetReserve);
        //console.log("vEURnew is", vEURnew);
        //console.log("vUSDnew is", vUSDnew);
        //console.log("buy is", buy);

        _updateBalances(vUSDnew, vEURnew);

        return buy;
    }

    /* mint vEUR to close long euro */
    function _mintVEUR(uint256 amount) internal returns (uint256) {
        uint256 vEURnew = pool.vEUR + amount;
        uint256 vUSDnew = pool.totalAssetReserve / vEURnew; // x = k / y
        uint256 sell = pool.vUSD - vUSDnew;

        //console.log("pool.totalAssetReserve is", pool.totalAssetReserve);
        //console.log("vEURnew is", vEURnew);
        //console.log("vUSDnew is", vUSDnew);
        //console.log("sell is", sell);
        _updateBalances(vUSDnew, vEURnew);

        return sell;
    }

    /* burn vEUR to close short euro */
    function _burnVEUR(uint256 amount) internal returns (uint256) {
        uint256 vEURnew = pool.vEUR - amount;
        uint256 vUSDnew = pool.totalAssetReserve / vEURnew; // x = k / y
        uint256 sell = vUSDnew - pool.vUSD;

        _updateBalances(vUSDnew, vEURnew);

        return sell;
    }

    /* update reserve balances after buying/selling */
    function _updateBalances(uint256 _vUSDnew, uint256 _vEURnew) internal {
        uint256 newPrice = (_vUSDnew * 10**18) / _vEURnew;

        //console.log("vamm state before is", pool.price, pool.vUSD, pool.vEUR);
        pool.price = newPrice;
        pool.vUSD = _vUSDnew;
        pool.vEUR = _vEURnew;

        //console.log("vamm state after is", pool.price, pool.vUSD, pool.vEUR);
        emit NewReserves(_vUSDnew, _vEURnew, newPrice, block.number);
    }
}
