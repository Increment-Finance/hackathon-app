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
  const [price, setPoolPrice] = useState();
  const [marginRatio, setMarginRatio] = useState();
  const [entryPrice, setEntryPrice] = useState();
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
    const price = formatEther(
      await perpetualContract.getPoolPrice()
    );
    try {
    const entryPrice = formatEther(
      await perpetualContract.getEntryPrice(userAddress)
    );
    }
   catch(err) {
    console.log("wewe");
   }

try{

const pnl = formatEther(
  await perpetualContract.getPnl(userAddress)
);
}catch(err) {
  console.log("weewoo");
}

    return {
      shorts,
      longs,
      portfolio,
      price,
      marginRatio,
      entryPrice,
      pnl
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
        .then(result => {
          if (subscribed) {
            setShorts(result.shorts);
            setLongs(result.longs);
            setPortfolio(result.portfolio);
            setPoolPrice(result.price);
            setMarginRatio(result.marginRatio);
            setEntryPrice(result.entryPrice);
            setPnl(result.pnl);
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

  return { shorts, longs, portfolio, price,  marginRatio, entryPrice, pnl };
}
