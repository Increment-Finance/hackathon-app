// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/// @title Returns chainlink prices for reserve tokens
/// @notice Requires chainlink contract at address (works for kovan, rinkeby, mainnet (forking))
/// @dev Change address for deployment
contract PriceConsumerV3 {
    AggregatorV3Interface internal priceFeedEurUsd;

    /* Price feed: EUR/USD
     * Mainnet Address: 0xb49f677943BC038e9857d61E7d053CaA2C1734C1
     * Kovan Address: 0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13
     * Rinkeby Address: 0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F
     */
    /// https://docs.chain.link/docs/reference-contracts/
    constructor() {
        priceFeedEurUsd = AggregatorV3Interface(
            0xb49f677943BC038e9857d61E7d053CaA2C1734C1
        );
    }

    /// @notice Returns the latest EURO / USD price with 8 decimals precision
    function getEURPrice() public view returns (int256) {
        (, int256 price, , uint256 timeStamp, ) =
            priceFeedEurUsd.latestRoundData();
        // If the round is not complete yet, timestamp is 0
        require(timeStamp > 0, "Round not complete");
        return price;
        //return 12 * 10**7; // 1.2
    }
}
