import { useState, useEffect } from "react";
import { formatUnits, formatEther } from "@ethersproject/units";
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
  const [marginRatio, setMarginRatio] = useState();
  const [pnl, setPnl] = useState();
  const [entryPrice, setEntryPrice] = useState();
  const [poolPrice, setPoolPrice] = useState();

  const getContractInfo = async () => {
    const result = {};

    try {
      result.shorts = formatEther(
        await perpetualContract.getShortBalance(userAddress)
      );
    } catch (err) {
      console.error(err);
    }
    try {
      result.longs = formatEther(
        await perpetualContract.getLongBalance(userAddress)
      );
    } catch (err) {
      console.error(err);
    }
    try {
      result.portfolio = formatEther(
        await perpetualContract.getPortfolioValue(userAddress)
      );
    } catch (err) {
      console.error(err);
    }
    try {
      result.marginRatio = formatEther(
        await perpetualContract.getUserMarginRatio(userAddress)
      );
    } catch (err) {
      console.error(err);
    }
    try {
      const [pnlAmount, isPositive] = await perpetualContract.getUnrealizedPnL(
        userAddress
      );
      result.pnl = isPositive ? pnlAmount.toNumber() : -pnlAmount.toNumber();
    } catch (err) {
      console.error(err);
    }
    try {
      result.entryPrice = formatEther(
        await perpetualContract.getEntryPrice(userAddress)
      );
    } catch (err) {
      console.error(err);
    }
    try {
      result.poolPrice = formatEther(await perpetualContract.getPoolPrice());
    } catch (err) {
      console.error(err);
    }
    try {
      let coins = [];
      for (let i in addresses[network.name].supportedCollateral) {
        let coin = addresses[network.name].supportedCollateral[i];
        coins.push({
          ...coin,
          balance: formatEther(
            await perpetualContract.getReserveBalance(userAddress, coin.address)
          )
        });
      }
      result.coins = coins;
    } catch (err) {
      console.error(err);
    }

    return result;
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
            setMarginRatio(result.marginRatio);
            setPnl(result.pnl);
            setEntryPrice(result.entryPrice);
            setPoolPrice(result.poolPrice);
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

  return {
    poolPrice,
    entryPrice,
    shorts,
    longs,
    portfolio,
    coins,
    pnl,
    marginRatio
  };
}
