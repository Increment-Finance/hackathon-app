// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../lib/PerpetualTypes.sol";
import "hardhat/console.sol";

import {Storage} from "./Storage.sol";

/// @title A perpetual contract w/ aTokens as collateral
/// @author Markus Schick
/// @notice You can only buy one type of perpetual and only use USDC as reserve

contract Reserve is Storage {
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

    /* withdraw */
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
