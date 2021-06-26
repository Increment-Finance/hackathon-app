import { useState, useEffect } from "react";
import AggregatorV3Interface from "../contracts/AggregatorV3Interface.abi";
import { Contract } from "@ethersproject/contracts";

export default function useChainlinkPrice(symbol, provider, addresses) {
  const [price, setPrice] = useState();

  useEffect(() => {
    let subscribed = true;

    if (provider && symbol && addresses) {
      let contract;

      if (symbol === "EUR") {
        contract = new Contract(
          addresses.EUR_USD,
          AggregatorV3Interface,
          provider
        );
      } else if (symbol === "USDC") {
        contract = new Contract(
          addresses.USDC_USD,
          AggregatorV3Interface,
          provider
        );
      } else if (symbol === "ETH") {
        contract = new Contract(
          addresses.ETH_USD,
          AggregatorV3Interface,
          provider
        );
      }

      contract
        .latestRoundData()
        .then(result => {
          if (subscribed) {
            setPrice(result.answer.toNumber() / 100000000);
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
    return () => {
      subscribed = false;
    };
  }, [symbol, provider, addresses]);

  return price;
}
