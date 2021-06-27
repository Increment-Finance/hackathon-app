// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

interface IPerpetual {
    ///  macro views
    function getReserveAssets() external view returns (address[] memory);

    function getPoolInfo() external view returns (PerpetualTypes.Pool memory);

    function getEUROracle() external view returns (address);

    function getAssetracle(address _asset) external view returns (address);

    function getAssetPrice(address _oracleAddress)
        external
        view
        returns (uint256);

    // user views
    function getReserveBalance(address account, address _token) external view;

    function getLongBalance(address account) external view returns (uint256);

    function getShortBalance(address account) external view returns (uint256);

    function getUserNotional(address account) external view returns (uint256);

    function getPortfolioValue(address account) external view returns (uint256);

    function getUserMarginRatio(address account)
        external
        view
        returns (uint256);

    // Reserve
    function deposit(uint256 _amount, address _token) external;

    function withdraw(uint256 _amount, address _token) external;

    // MinterRedeemer

    function MintLongEUR(uint256 _amount) external returns (uint256);

    function RedeemLongEUR(uint256 _amount, address _redeemAsset)
        external
        returns (uint256);

    function MintShortEUR(uint256 _amount) external returns (uint256);

    function RedeemShortEUR(uint256 _amount, address _redeemAsset)
        external
        returns (uint256);
}

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
