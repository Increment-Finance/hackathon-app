// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "./PriceConsumerV3.sol";
import "./lib/PerpetualTypes.sol";
import "hardhat/console.sol";

/// @title A perpetual contract w/ aTokens as collateral
/// @author Markus Schick
/// @notice under current development

contract Position {
    /************************* state *************************/

    struct UserPosition {
        uint256 EURUSDlong;
        uint256 EURUSDshort;
        uint256 usdNotional;
        PerpetualTypes.CollateralType collateralType;
    }
    struct UserIndex {
        uint256 blockNumber;
        uint256 amount;
        bool isPositive;
    }

    mapping(address => UserPosition) userPosition;

    /************************* events *************************/

    /************************* external *************************/

    /************************* view functions *************************/

    function getUserPosition(address _address)
        public
        view
        returns (UserPosition memory)
    {
        return userPosition[_address];
    }

    /************************* helper functions *************************/
}
