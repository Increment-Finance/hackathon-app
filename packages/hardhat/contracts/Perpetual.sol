// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
//import "@aave/protocol-v2/contracts/interfaces/IAToken.sol";
import "./PriceConsumerV3.sol";
import "./Position.sol";
import "./Reserve.sol";
import "./vAMM.sol";
import "hardhat/console.sol";

/// @title A perpetual contract w/ aTokens as collateral
/// @author Markus Schick
/// @notice You can only buy one type of perpetual and only use USDC as reserve

/// toDO:
// aUSDC (as reserve)
// scale down aTokens (see: https://docs.aave.com/developers/the-core-protocol/atokens#scaledbalanceof
// add funding rate payments (TWAP, looping, ..) (check PerpetualSwaps/Implementation/decentralized/dYdX/perpetual/contracts/protocol/v1/impl/P1Settlement.sol)
// add liquidations

// add aETH supports
// add borrow money from Aave

contract Perpetual is PriceConsumerV3, Reserve, vAMM, Position, Ownable {
    using SafeERC20 for IERC20;

    /************************* state *************************/

    /************************* events *************************/

    event buyEURUSDlong(
        uint256,
        address indexed,
        PerpetualTypes.CollateralType
    );
    event buyEURUSDshort(
        uint256,
        address indexed,
        PerpetualTypes.CollateralType
    );

    event sellEURUSDlong(
        uint256,
        address indexed,
        PerpetualTypes.CollateralType
    );
    event sellEURUSDshort(
        uint256,
        address indexed,
        PerpetualTypes.CollateralType
    );

    /************************* constructor *************************/

    constructor(
        address _token_addr,
        uint256 _quoteAssetReserve,
        uint256 _baseAssetReserve
    ) PriceConsumerV3() vAMM(_quoteAssetReserve, _baseAssetReserve) {
        USDC = IERC20(_token_addr);
    }

    /************************* external *************************/

    function leverageIsFine() public pure returns (bool) {
        return true;
    }

    /* go long EURUSD */

    function MintLongEUR(
        uint256 _amount,
        PerpetualTypes.CollateralType _collateralType
    ) public returns (uint256) {
        require(
            userPosition[msg.sender].EURUSDshort == 0,
            "User can not go long w/ an open short position"
        );
        require(leverageIsFine(), "Leverage factor is too high");
        uint256 EURUSDlongBought = _mintVUSD(_amount);

        userPosition[msg.sender].collateralType = _collateralType;
        userPosition[msg.sender].usdNotional += _amount;
        userPosition[msg.sender].EURUSDlong += EURUSDlongBought;

        return EURUSDlongBought;
    }

    function RedeemLongEUR(uint256 _amount) public returns (uint256) {
        require(
            userPosition[msg.sender].EURUSDlong >= _amount,
            "USDC balances are too low"
        );

        userPosition[msg.sender].EURUSDlong -= _amount;

        uint256 EURUSDlongSold = _mintVEUR(_amount);
        uint256 EURUSDlongBought = userPosition[msg.sender].usdNotional;

        if (EURUSDlongSold >= EURUSDlongBought) {
            balances[msg.sender].USDCBalance += (EURUSDlongSold -
                EURUSDlongBought);
        } else if (EURUSDlongSold < EURUSDlongBought) {
            balances[msg.sender].USDCBalance -= (EURUSDlongBought -
                EURUSDlongSold);
        }
        return EURUSDlongSold;
    }

    /* go short EURUSD */
    function MintShortEUR(
        uint256 _amount,
        PerpetualTypes.CollateralType _collateralType
    ) public returns (uint256) {
        require(
            userPosition[msg.sender].EURUSDlong == 0,
            "User can not go long w/ an open short position"
        );
        require(leverageIsFine(), "Leverage factor is too high");
        uint256 EURUSDshortBought = _burnVUSD(_amount);

        userPosition[msg.sender].collateralType = _collateralType;
        userPosition[msg.sender].usdNotional += _amount;
        userPosition[msg.sender].EURUSDlong += EURUSDshortBought;

        return EURUSDshortBought;
    }

    function RedeemshortEUR(uint256 _amount) public returns (uint256) {
        require(
            userPosition[msg.sender].EURUSDshort >= _amount,
            "USDC balances are too low"
        );

        userPosition[msg.sender].EURUSDshort -= _amount;

        uint256 EURUSDshortSold = _burnVEUR(_amount);
        uint256 EURUSDshortBought = userPosition[msg.sender].usdNotional;

        if (EURUSDshortSold >= EURUSDshortBought) {
            balances[msg.sender].USDCBalance += (EURUSDshortSold -
                EURUSDshortBought);
        } else if (EURUSDshortSold < EURUSDshortBought) {
            balances[msg.sender].USDCBalance -= (EURUSDshortBought -
                EURUSDshortSold);
        }
        return EURUSDshortSold;
    }

    /************************* view functions *************************/
}
