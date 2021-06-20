// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";

contract vAMM {
    /************************* state *************************/

    // total liquidity (k)
    uint256 totalAssetReserve;

    // vEUR
    uint256 vEUR;

    // vEURshort
    uint256 vUSD;

    // leverage
    uint256 leverage;

    constructor(
        uint256 _vEUR,
        uint256 _vUSD,
        uint256 _leverage
    ) {
        vEUR = _vEUR;
        vUSD = _vUSD;
        totalAssetReserve = _vEUR * _vUSD;
        leverage = _leverage;
    }

    /************************* events *************************/
    event NewReserves(uint256 vUSD, uint256 vEUR, uint256 blockNumber);

    /************************* internal *************************/

    /* mint VUSD to buy */
    function _mintVUSD(uint256 amount) internal returns (uint256) {
        uint256 vUSDnew = vUSD + amount;
        uint256 vEURnew = totalAssetReserve / vUSDnew; // x = k / y
        uint256 buy = vEUR - vEURnew;

        _updateBalances(vUSDnew, vEURnew);

        return buy;
    }

    /* mint vEUR to buy */
    function _mintVEUR(uint256 amount) internal returns (uint256) {
        uint256 vEURnew = vUSD + amount;
        uint256 vUSDnew = totalAssetReserve / vEURnew; // x = k / y
        uint256 buy = vEUR - vUSDnew;

        _updateBalances(vUSDnew, vEURnew);

        return buy;
    }

    /* burn vUSD to sell */
    function _burnVUSD(uint256 amount) internal returns (uint256) {
        uint256 vUSDnew = vUSD - amount;
        uint256 vEURnew = totalAssetReserve / vUSDnew; // x = k / y
        uint256 sell = vEURnew - vEUR;

        _updateBalances(vUSDnew, vEURnew);

        return sell;
    }

    /* burn vEUR to sell */
    function _burnVEUR(uint256 amount) internal returns (uint256) {
        uint256 vEURnew = vEUR - amount;
        uint256 vUSDnew = totalAssetReserve / vEURnew; // x = k / y
        uint256 sell = vUSDnew - vUSD;

        _updateBalances(vUSDnew, vEURnew);

        return sell;
    }

    /* update reserve balances after buying/selling */
    function _updateBalances(uint256 _vUSDnew, uint256 _vEURnew) internal {
        vUSD = _vUSDnew;
        vEUR = _vEURnew;

        emit NewReserves(_vUSDnew, _vEURnew, block.number);
    }
}
