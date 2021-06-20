// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";

contract vAMM {
    /************************* state *************************/

    // total liquidity (k)
    uint256 totalAssetReserve;

    // vEURlong
    uint256 vEURlong;

    // vEURshort
    uint256 vEURshort;

    // leverage
    uint256 leverage;

    constructor(
        uint256 _vEURlong,
        uint256 _vEURshort,
        uint256 _leverage
    ) {
        vEURlong = _vEURlong;
        vEURshort = _vEURshort;
        totalAssetReserve = _vEURlong * _vEURshort;
        leverage = _leverage;
    }

    /************************* events *************************/
    event NewReserves(
        uint256 vUSDCreserve,
        uint256 vEURreserve,
        uint256 blockNumber
    );

    /************************* internal *************************/

    /************************* external *************************/
    // open long position
}
