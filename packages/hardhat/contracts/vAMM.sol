// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "hardhat/console.sol";

contract vAMM {
    /************************* state *************************/

    struct Pool {
        uint256 vEUR;
        uint256 vUSD;
        uint256 totalAssetReserve;
        uint256 price; // 10 ** 18
    }
    Pool pool;

    constructor(uint256 _vEUR, uint256 _vUSD) {
        pool.vEUR = _vEUR;
        pool.vUSD = _vUSD;
        pool.totalAssetReserve = _vEUR * _vUSD;
    }

    /************************* events *************************/
    event NewReserves(
        uint256 vUSD,
        uint256 vEUR,
        uint256 newPrice,
        uint256 blockNumber
    );

    /************************* internal *************************/

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
        uint256 sell = vEURnew - pool.vEUR;

        _updateBalances(vUSDnew, vEURnew);

        return sell;
    }

    /* mint vEUR to close long euro */
    function _mintVEUR(uint256 amount) internal returns (uint256) {
        uint256 vEURnew = pool.vUSD + amount;
        uint256 vUSDnew = pool.totalAssetReserve / vEURnew; // x = k / y
        uint256 buy = pool.vEUR - vUSDnew;

        _updateBalances(vUSDnew, vEURnew);

        return buy;
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

        pool.price = newPrice;
        pool.vUSD = _vUSDnew;
        pool.vEUR = _vEURnew;

        emit NewReserves(_vUSDnew, _vEURnew, newPrice, block.number);
    }

    /************************* view functions *************************/

    /// @notice Returns information about the virtual Automated Market Maker (vAMM)
    /// @return pool struct has properties vEUR, vUSD, totalAssetReserve (x*y=k) and price
    function getPoolInfo() public view returns (Pool memory) {
        return pool;
    }
}
