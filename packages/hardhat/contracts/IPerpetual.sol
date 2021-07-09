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

    struct Price {
        uint256 price;
        uint256 time;
        uint80 id;
    }
}

interface IPerpetual {
    function MintLongQuote(uint256 _amount) external returns (uint256);

    function MintLongWithLeverage(uint8 _leverage) external returns (uint256);

    function MintShortQuote(uint256 _amount) external returns (uint256);

    function MintShortWithLeverage(uint8 _leverage) external returns (uint256);

    function RedeemLongQuote(address _redeemAsset) external returns (uint256);

    function RedeemShortQuote(address _redeemAsset) external returns (uint256);

    function _TOKENS_(uint256) external view returns (address);

    function _getFundingRate()
        external
        view
        returns (PerpetualTypes.Index memory);

    function allowWithdrawal(
        address account,
        address _token,
        uint256 _amount
    ) external view returns (bool);

    function balances(address)
        external
        view
        returns (
            uint256 QuoteLong,
            uint256 QuoteShort,
            uint256 usdNotional
        );

    function deposit(uint256 _amount, address _token) external;

    function getAssetOracle(address _asset) external view returns (address);

    function getAssetPrice(address _oracleAddress)
        external
        view
        returns (uint256);

    function getAssetPriceByTokenAddress(address _tokenAddress)
        external
        view
        returns (uint256);

    function getAssetValue(address account, address token)
        external
        view
        returns (uint256);

    function getEntryPrice(address account) external view returns (uint256);

    function getFundingRate()
        external
        view
        returns (PerpetualTypes.Index memory);

    function getLongBalance(address account) external view returns (uint256);

    function getPnl(address account) external view returns (uint256);

    function getPoolInfo() external view returns (PerpetualTypes.Pool memory);

    function getPoolPrice() external view returns (uint256);

    function getPortfolioValue(address account) external view returns (uint256);

    function getQuoteAssetOracle() external view returns (address);

    function getReserveAssets() external view returns (address[] memory);

    function getReserveBalance(address account, address _token)
        external
        view
        returns (uint256);

    function getShortBalance(address account) external view returns (uint256);

    function getUnrealizedPnL(address account)
        external
        view
        returns (PerpetualTypes.Int memory);

    function getUserMarginRatio(address account)
        external
        view
        returns (uint256);

    function getUserNotional(address account) external view returns (uint256);

    function getVAMMsnapshots(uint256 _id)
        external
        view
        returns (PerpetualTypes.Price memory);

    function global_index()
        external
        view
        returns (
            uint256 blockNumber,
            uint256 value,
            bool isPositive
        );

    function index(address)
        external
        view
        returns (
            uint256 blockNumber,
            uint256 value,
            bool isPositive
        );

    function owner() external view returns (address);

    function pool()
        external
        view
        returns (
            uint256 vQuote,
            uint256 vBase,
            uint256 totalAssetReserve,
            uint256 price
        );

    function pushSnapshot() external;

    function renounceOwnership() external;

    function setReserveToken(
        address _asset,
        address _priceOracle,
        bool _isAToken,
        address _aaveReserve
    ) external;

    function settleAccount(address user, address _redeemAsset) external;

    function transferOwnership(address newOwner) external;

    function updateFundingRate() external;

    function withdraw(uint256 _amount, address _token) external;
}
