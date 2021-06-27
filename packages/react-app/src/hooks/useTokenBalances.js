import { useState, useEffect } from "react";
import erc20 from "../contracts/erc20.abi";
import addresses from "../utils/addresses";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";

export default function useTokenBalances(provider, network, userAddress) {
  const [balances, setBalances] = useState();

  const getBalances = async () => {
    let coinBalances = [];
    for (let i in addresses[network.name].supportedCollateral) {
      let coin = addresses[network.name].supportedCollateral[i];
      coinBalances.push(
        await new Contract(coin.address, erc20, provider)
          .balanceOf(userAddress)
          .then(result => ({ ...coin, balance: formatUnits(result, 6) }))
          .catch(err => {
            console.error(err);
          })
      );
    }
    return coinBalances;
  };

  useEffect(() => {
    let subscribed = true;
    if (
      provider &&
      userAddress &&
      network &&
      addresses[network.name]?.supportedCollateral
    ) {
      getBalances()
        .then(result => {
          if (subscribed) {
            setBalances(result);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
    return () => {
      subscribed = false;
    };
  }, [provider, network, userAddress]);

  return balances;
}
