// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/// @notice Describes all complex types

library PerpetualTypes {
    struct UserPosition {
        mapping(address => uint256) userReserve;
        uint256 EURUSDlong;
        uint256 EURUSDshort;
        uint256 usdNotional;
    }

    struct UserIndex {
        uint256 blockNumber;
        uint256 amount;
        bool isPositive;
    }

    struct Pool {
        uint256 vEUR;
        uint256 vUSD;
        uint256 totalAssetReserve;
        uint256 price; // 10 ** 18
    }
}
