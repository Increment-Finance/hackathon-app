// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {PerpetualTypes} from "./lib/PerpetualTypes.sol";

interface IPerpetual {
    function MintLongQuote(uint256 _amount) external returns (uint256);

    function MintLongWithLeverage(uint8 _leverage) external returns (uint256);

    function MintShortQuote(uint256 _amount) external returns (uint256);

    function MintShortWithLeverage(uint8 _leverage) external returns (uint256);

    function RedeemLongQuote(address _redeemAsset) external returns (uint256);

    function RedeemShortQuote(address _redeemAsset) external returns (uint256);

    function _TOKENS_(uint256) external view returns (address);

    function allowWithdrawal(
        address account,
        address _token,
        uint256 _amount
    ) external view returns (bool);

    function c_0x1cbcf40b(bytes32 c__0x1cbcf40b) external pure;

    function c_0x5d2a36c2(bytes32 c__0x5d2a36c2) external pure;

    function c_0x8115ecdc(bytes32 c__0x8115ecdc) external pure;

    function c_0x9f9d8e17(bytes32 c__0x9f9d8e17) external pure;

    function c_0xdec12f0d(bytes32 c__0xdec12f0d) external pure;

    function c_0xe6142b1d(bytes32 c__0xe6142b1d) external pure;

    function c_0xf288155d(bytes32 c__0xf288155d) external pure;

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

    function getLongBalance(address account) external view returns (uint256);

    function getPoolInfo() external view returns (PerpetualTypes.Pool memory);

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
        returns (PerpetualTypes.Pool memory);

    function getUserMarginRatio(address account)
        external
        view
        returns (uint256);

    function getUserNotional(address account) external view returns (uint256);

    function owner() external view returns (address);

    function renounceOwnership() external;

    function setReserveToken(
        address _asset,
        address _priceOracle,
        bool _isAToken,
        address _aaveReserve
    ) external;

    function transferOwnership(address newOwner) external;

    function withdraw(uint256 _amount, address _token) external;
}
