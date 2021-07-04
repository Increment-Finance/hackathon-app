// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

/// @notice Describes all complex types

library PerpetualTypes {
    struct UserPosition {
        mapping(address => uint256) userReserve;
        uint256 QuoteLong;
        uint256 QuoteShort;
        uint256 usdNotional;
    }

    struct Index {
        uint256 blockNumber;
        uint256 value;
        bool isPositive;
    }

    struct Int {
        uint256 value;
        bool isPositive;
    }

    struct Pool {
        uint256 vQuote;
        uint256 vBase;
        uint256 totalAssetReserve;
        uint256 price; // 10 ** 18
    }
}
