import { useState, useEffect } from "react";
import addresses from "../utils/addresses";

export default function useContractBalances(
  perpetualContract,
  userAddress,
  network
) {
  const [shorts, setShorts] = useState();
  const [longs, setLongs] = useState();
  const [portfolio, setPortfolio] = useState();
  const [coins, setCoins] = useState();

  const getContractInfo = async () => {
    const shorts = (
      await perpetualContract.getShortBalance(userAddress)
    ).toNumber();
    const longs = (
      await perpetualContract.getLongBalance(userAddress)
    ).toNumber();
    const portfolio = (
      await perpetualContract.getPortfolioValue(userAddress)
    ).toNumber();
    let coins = [];
    for (let i in addresses[network.name].supportedCollateral) {
      let coin = addresses[network.name].supportedCollateral[i];
      coins.push({
        ...coin,
        inContract: (
          await perpetualContract.getReserveBalance(userAddress, coin.address)
        ).toNumber()
      });
    }

    return {
      shorts,
      longs,
      portfolio,
      coins
    };
  };

  useEffect(() => {
    let subscribed = true;
    if (
      perpetualContract &&
      userAddress &&
      network &&
      addresses[network.name] &&
      addresses[network.name].supportedCollateral
    ) {
      getContractInfo()
        .then(result => {
          if (subscribed) {
            setShorts(result.shorts);
            setLongs(result.longs);
            setPortfolio(result.portfolio);
            setCoins(result.coins);
          }
        })
        .catch(err => {
          console.log("Couldn't Read Contract Data", err);
        });
    }

    return () => {
      subscribed = false;
    };
  }, [perpetualContract, userAddress, network]);

  return { shorts, longs, portfolio, coins };
}
