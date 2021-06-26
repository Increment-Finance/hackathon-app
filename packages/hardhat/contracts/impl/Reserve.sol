// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

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
        SafeERC20.safeTransferFrom(
            IERC20(_token),
            msg.sender,
            address(this),
            _amount
        );
        balances[msg.sender].userReserve[_token] += _amount;
        emit Deposit(_amount, msg.sender, _token);
    }

    /// @notice Check if user withdrawing funds would exceed margin
    /// TODO: optimize etPortfolioValue(account) - _amount * _assetValue(account, _token) calculation
    function _allowWithdrawal(
        address account,
        address _token,
        uint256 _amount
    ) public view returns (bool) {
        uint256 newMarginRatio = _marginRatio(
            getPortfolioValue(account) - _amount * _assetValue(account, _token),
            getUnrealizedPnL(),
            getUserNotional(account)
        );
        //console.log("newMarginRatio is: ", newMarginRatio);
        uint256 maxInitialMargin = 10**17; // 10 %
        return newMarginRatio >= maxInitialMargin;
    }

    /**
     * @notice Withdraw ERC20 token from margin of the contract account.
     * @param  _amount  Amount of USDC deposited
     * @param _token ERC20 token address
     * @dev Only allows withdrawing tokens accounted in _TOKENS_ list
     */
    function withdraw(uint256 _amount, address _token) public {
        require(
            _amount <= balances[msg.sender].userReserve[_token],
            "Can not require more than in balance"
        );
        balances[msg.sender].userReserve[_token] -= _amount;
        SafeERC20.safeTransfer(IERC20(_token), msg.sender, _amount);
        emit Withdraw(_amount, msg.sender, _token);
    }
}
