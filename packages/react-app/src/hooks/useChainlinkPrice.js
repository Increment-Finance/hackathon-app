import { useState, useEffect } from "react";
import AggregatorV3Interface from "../contracts/AggregatorV3Interface.abi";
import addresses from "../utils/addresses";
import { Contract } from "@ethersproject/contracts";

export default function useChainlinkPrice(symbol, provider) {
  const [price, setPrice] = useState();
  const [network, setNetwork] = useState();

  useEffect(() => {
    let subscribed = true;

    if (provider && symbol && network && network.name) {
      let contract;

      if (symbol === "EUR") {
        contract = new Contract(
          addresses[network.name].oracles.EUR_USD,
          AggregatorV3Interface,
          provider
        );
      } else if (symbol === "USDC") {
        contract = new Contract(
          addresses[network.name].oracles.USDC_USD,
          AggregatorV3Interface,
          provider
        );
      } else if (symbol === "ETH") {
        contract = new Contract(
          addresses[network.name].oracles.ETH_USD,
          AggregatorV3Interface,
          provider
        );
      } else if (symbol === "JPY") {
        contract = new Contract(
          addresses[network.name].oracles.JPY_USD,
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
  }, [symbol, provider, network]);

  useEffect(() => {
    if (provider) {
      provider
        .getNetwork()
        .then(result => {
          setNetwork(result);
        })
        .catch(err => {
          console.error(err);
        });
    }
  }, [provider]);

  return price;
}
