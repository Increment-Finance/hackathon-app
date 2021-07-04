// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import {PerpetualTypes} from "../lib/PerpetualTypes.sol";
import {SignedMath} from "../lib/SignedMath.sol";
import {Getter} from "./Getter.sol";

import "hardhat/console.sol";

/// @notice Calculates funding rates (uses Signed Math library of dYdX)

contract Funding is Getter {
    using SignedMath for SignedMath.Int;

    // events
    event LogFundingPayment(
        uint256 indexed blockNumber,
        uint256 value,
        bool isPositive
    );

    /// @dev toDo: TWAP price
    function getPoolPrice() internal view returns (uint256) {
        return pool.price;
    }

    function updateFundingRate() public {
        SignedMath.Int memory fundingRate = _getFundingRate();
        _setFundingRate(fundingRate);
        emit LogFundingPayment(
            block.number,
            fundingRate.value,
            fundingRate.isPositive
        );
    }

    function _getFundingRate() public view returns (SignedMath.Int memory) {
        uint256 decimals = 10**8;
        uint256 priceIndex = getAssetPrice(quoteAssetOracle);
        uint256 pricePerpetual = getPoolPrice();

        SignedMath.Int memory funding;
        if (priceIndex >= pricePerpetual) {
            funding.isPositive = true;
            funding.value =
                ((priceIndex - pricePerpetual) * decimals) /
                (priceIndex * 24);
        } else {
            funding.isPositive = false;
            funding.value =
                ((pricePerpetual - priceIndex) * decimals) /
                (priceIndex * 24);
        }

        return funding;
    }

    // functions
    function _setFundingRate(SignedMath.Int memory fundingRate) internal {
        // load old funding rate
        PerpetualTypes.Index memory currentIndex = global_index;

        if (global_index.blockNumber < block.number) {
            // convert to signed int
            SignedMath.Int memory currentIndexInt = SignedMath.Int({
                value: currentIndex.value,
                isPositive: currentIndex.isPositive
            });

            // new index values
            SignedMath.Int memory new_global_index = currentIndexInt.signedAdd(
                fundingRate
            );

            // update index
            global_index = PerpetualTypes.Index({
                value: new_global_index.value,
                isPositive: new_global_index.isPositive,
                blockNumber: block.number
            });
        }
    }
}
