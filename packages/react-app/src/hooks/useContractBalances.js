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

  const getContractInfo = async () => {
    const shorts = formatEther(
      await perpetualContract.getShortBalance(userAddress)
    );
    const longs = formatEther(
      await perpetualContract.getLongBalance(userAddress)
    );
    const portfolio = formatEther(
      await perpetualContract.getPortfolioValue(userAddress)
    );
    const marginRatio = formatEther(
      await perpetualContract.getUserMarginRatio(userAddress)
    );

    const [pnlAmount, isPositive] = await perpetualContract.getUnrealizedPnL(
      userAddress
    );

    let coins = [];
    for (let i in addresses[network.name].supportedCollateral) {
      let coin = addresses[network.name].supportedCollateral[i];
      coins.push({
        ...coin,
        balance: formatEther(
          await perpetualContract.getReserveBalance(userAddress, coin.address)
        ),
      });
    }

    return {
      shorts,
      longs,
      portfolio,
      coins,
      marginRatio,
      // pnl: isPositive ? pnlAmount.toNumber() : -pnlAmount.toNumber()
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
        .then((result) => {
          if (subscribed) {
            setShorts(result.shorts);
            setLongs(result.longs);
            setPortfolio(result.portfolio);
            setCoins(result.coins);
            setMarginRatio(result.marginRatio);
            setPnl(result.pnl);
          }
        })
        .catch((err) => {
          console.log("Couldn't Read Contract Data", err);
        });
    }

    return () => {
      subscribed = false;
    };
  }, [perpetualContract, userAddress, network]);

  return { shorts, longs, portfolio, coins, pnl, marginRatio };
}
