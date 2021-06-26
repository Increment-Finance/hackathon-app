import { useState, useEffect } from "react";
import AggregatorV3Interface from "../contracts/AggregatorV3Interface.abi";
import { Contract } from "@ethersproject/contracts";
import { getOracleAddress } from "../utils/chainlink.js";

export default function useChainlinkPrice(symbol, provider, network) {
  const [price, setPrice] = useState();
  const { ETH_USD, USDC_USD, EUR_USD } = getOracleAddress(network);

  useEffect(() => {
    let subscribed = true;

    if (provider && symbol) {
      let contract;

      if (symbol === "EUR") {
        // console.log(EUR_USD, AggregatorV3Interface, provider);
        contract = new Contract(EUR_USD, AggregatorV3Interface, provider);
      } else if (symbol === "USDC") {
        contract = new Contract(USDC_USD, AggregatorV3Interface, provider);
      } else if (symbol === "ETH") {
        contract = new Contract(ETH_USD, AggregatorV3Interface, provider);
      }

      contract
        .latestRoundData()
        .then(result => {
          if (subscribed) {
            setPrice(result.answer.toNumber() / 100000000);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    return () => {
      subscribed = false;
    };
  }, [symbol, provider, network]);

  return price;
}
