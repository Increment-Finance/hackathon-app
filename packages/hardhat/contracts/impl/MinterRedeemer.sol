// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@aave/protocol-v2/contracts/interfaces/IAToken.sol";
import "../lib/PerpetualTypes.sol";
import "./vAMM.sol";
import "./Storage.sol";
import "./Getter.sol";
import "hardhat/console.sol";

/// @title A perpetual contract w/ aTokens as collateral
/// @author Markus Schick
/// @notice You can only buy one type of perpetual and only use USDC as reserve

contract MinterRedeemer is Storage, vAMM {
    using SafeERC20 for IERC20;

    constructor(uint256 _quoteAssetReserve, uint256 _baseAssetReserve) {
        pool.vEUR = _quoteAssetReserve;
        pool.vUSD = _baseAssetReserve;
        pool.totalAssetReserve = _quoteAssetReserve * _baseAssetReserve;
    }

    /************************* events *************************/

    event buyEURUSDlong(uint256, address indexed);
    event buyEURUSDshort(uint256, address indexed);

    event sellEURUSDlong(uint256, address indexed);
    event sellEURUSDshort(uint256, address indexed);

    /* go long EURUSD */

    /// @notice Check if user leverage allows operation
    function leverageIsFine() public pure returns (bool) {
        return true;
    }

    function MintLongEUR(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].EURUSDshort == 0,
            "User can not go long w/ an open short position"
        );
        require(leverageIsFine(), "Leverage factor is too high");
        uint256 EURUSDlongBought = _mintVUSD(_amount, pool);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].EURUSDlong += EURUSDlongBought;

        emit buyEURUSDlong(_amount, msg.sender);
        return EURUSDlongBought;
    }

    function RedeemLongEUR(uint256 _amount, address _redeemAsset)
        public
        returns (uint256)
    {
        require(
            balances[msg.sender].EURUSDlong >= _amount,
            "USDC balances are too low"
        );

        balances[msg.sender].EURUSDlong -= _amount;

        uint256 EURUSDlongSold = _mintVEUR(_amount, pool);
        uint256 EURUSDlongBought = balances[msg.sender].usdNotional;

        if (EURUSDlongSold >= EURUSDlongBought) {
            balances[msg.sender].userReserve[_redeemAsset] += (EURUSDlongSold -
                EURUSDlongBought);
        } else if (EURUSDlongSold < EURUSDlongBought) {
            balances[msg.sender].userReserve[
                _redeemAsset
            ] -= (EURUSDlongBought - EURUSDlongSold);
        }
        emit sellEURUSDlong(_amount, msg.sender);
        return EURUSDlongSold;
    }

    /* go short EURUSD */
    function MintShortEUR(uint256 _amount) public returns (uint256) {
        require(
            balances[msg.sender].EURUSDlong == 0,
            "User can not go long w/ an open short position"
        );
        require(leverageIsFine(), "Leverage factor is too high");
        uint256 EURUSDshortBought = _burnVUSD(_amount, pool);

        balances[msg.sender].usdNotional += _amount;
        balances[msg.sender].EURUSDlong += EURUSDshortBought;

        emit buyEURUSDshort(_amount, msg.sender);
        return EURUSDshortBought;
    }

    function RedeemshortEUR(uint256 _amount, address _redeemAsset)
        public
        returns (uint256)
    {
        require(
            balances[msg.sender].EURUSDshort >= _amount,
            "USDC balances are too low"
        );

        balances[msg.sender].EURUSDshort -= _amount;

        uint256 EURUSDshortSold = _burnVEUR(_amount, pool);
        uint256 EURUSDshortBought = balances[msg.sender].usdNotional;

        if (EURUSDshortSold >= EURUSDshortBought) {
            balances[msg.sender].userReserve[_redeemAsset] += (EURUSDshortSold -
                EURUSDshortBought);
        } else if (EURUSDshortSold < EURUSDshortBought) {
            balances[msg.sender].userReserve[
                _redeemAsset
            ] -= (EURUSDshortBought - EURUSDshortSold);
        }
        emit sellEURUSDshort(_amount, msg.sender);
        return EURUSDshortSold;
    }
}
