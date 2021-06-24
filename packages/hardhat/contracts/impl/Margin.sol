// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {Getter} from "./Getter.sol";

/// @dev Calculates the margin ratio of an account. To be depreciated ...

contract Margin is Getter {
    function _MarginRatio(address user) internal returns (uint256) {
        getPortfolioValue(user);
    }
}
