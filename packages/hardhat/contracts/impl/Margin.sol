// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import {Getter} from "./Getter.sol";

/// @title Returns the margin of an account
/// @dev Change address for deployment

contract Margin is Getter {
    function setMargin(address user, uint256 amount) public {
        balances[user].margin = amount;
    }
}
