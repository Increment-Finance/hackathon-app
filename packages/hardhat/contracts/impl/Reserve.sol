// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import {IAToken} from "./InterfaceAave/iaToken/IAToken.sol";
import {ILendingPool} from "./InterfaceAave/lendingPool/ILendingPool.sol";
import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {Getter} from "./Getter.sol";

import "hardhat/console.sol";

/// @notice Allows Depositing and Withdrawing of reserve tokens

contract Reserve is Getter {
    /************************* events *************************/

    event Deposit(uint256 amount, address indexed user, address indexed asset);
    event Withdraw(uint256, address indexed user, address indexed asset);

    /************************* functions *************************/

    /**
     * @notice Deposit ERC20 token as margin to the contract account.
     * @param  _amount  Amount of USDC deposited
     * @param _token ERC20 token address
     */
    function deposit(uint256 _amount, address _token) public {
        if (isAaveToken[_token]) {
            SafeERC20.safeTransferFrom(
                IERC20(_token),
                msg.sender,
                address(this),
                _amount
            );
            ILendingPool lendingpool = ILendingPool(LendingPool[_token]);
            uint256 scaledAmount = _amount /
                lendingpool.getReserveNormalizedIncome(_token);
            balances[msg.sender].userReserve[_token] += scaledAmount;
        } else {
            SafeERC20.safeTransferFrom(
                IERC20(_token),
                msg.sender,
                address(this),
                _amount
            );
            balances[msg.sender].userReserve[_token] += _amount;
        }

        emit Deposit(_amount, msg.sender, _token);
    }

    /// @notice Check if user withdrawing funds would exceed margin
    /// TODO: optimize getPortfolioValue(account) - _amount * _assetValue(account, _token) calculation
    function allowWithdrawal(
        address account,
        address _token,
        uint256 _amount
    ) public view returns (bool) {
        uint256 newPortfolioValue = getPortfolioValue(account) -
            (_amount * getAssetPriceByTokenAddress(_token)) /
            10**8;

        uint256 newMarginRatio = _marginRatio(
            newPortfolioValue,
            getUnrealizedPnL(account),
            getUserNotional(account)
        );

        //console.log("newMarginRatio is: ", newMarginRatio);
        uint256 maxInitialMargin = 10**17; // 10 %
        return newMarginRatio <= maxInitialMargin;
    }

    /**
     * @notice Withdraw ERC20 token from margin of the contract account.
     * @param _token ERC20 token address
     * @param  _amount  Amount of USDC deposited
     * @dev Only allows withdrawing tokens accounted in _TOKENS_ list
     */
    function withdraw(uint256 _amount, address _token) public {
        require(
            _amount <= balances[msg.sender].userReserve[_token],
            "Can not require more than in balance"
        );
        require(
            allowWithdrawal(msg.sender, _token, _amount),
            "Withdrawal would result in Liquidation"
        );
        balances[msg.sender].userReserve[_token] -= _amount;
        if (isAaveToken[_token]) {
            ILendingPool lendingpool = ILendingPool(LendingPool[_token]);
            uint256 unscaledAmount = _amount *
                lendingpool.getReserveNormalizedIncome(_token);
            SafeERC20.safeTransfer(IERC20(_token), msg.sender, unscaledAmount);
        } else {
            SafeERC20.safeTransfer(IERC20(_token), msg.sender, _amount);
        }

        emit Withdraw(_amount, msg.sender, _token);
    }
}
