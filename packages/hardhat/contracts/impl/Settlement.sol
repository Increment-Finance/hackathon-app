// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {SignedMath} from "../lib/SignedMath.sol";
import {Getter} from "./Getter.sol";

import "hardhat/console.sol";

/// @notice Settles the funding payment for some user account (uses Signed Math library of dYdX)

contract Settlement is Getter {
    using SignedMath for SignedMath.Int;

    function settleAccount(address user, address _redeemAsset) public {
        SignedMath.Int memory payment;

        PerpetualTypes.Index memory userIndex = index[user];
        PerpetualTypes.Index memory globalIndex = global_index;

        if (userIndex.blockNumber != globalIndex.blockNumber) {
            payment = SignedMath
            .Int({value: globalIndex.value, isPositive: globalIndex.isPositive})
            .signedSub(
                SignedMath.Int({
                    value: userIndex.value,
                    isPositive: userIndex.isPositive
                })
            );
            if (payment.isPositive) {
                balances[msg.sender].userReserve[
                    _redeemAsset
                ] += _convertDollarToAssets(payment.value, _redeemAsset);
            } else {
                balances[msg.sender].userReserve[
                    _redeemAsset
                ] -= _convertDollarToAssets(payment.value, _redeemAsset);
            }
        }
        isSettledAccount[user] = true;
    }
}
