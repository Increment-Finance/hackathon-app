import { useState, useEffect } from "react";
import { formatEther } from "@ethersproject/units";
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

  const getCoins = async () => {
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
    return coins;
  };

  const initListeners = () => {
    perpetualContract.on("Deposit", (value, user, asset) => {
      if (user === userAddress) {
        perpetualContract
          .getPortfolioValue(userAddress)
          .then(result => formatEther(result))
          .then(result => {
            setPortfolio(result);
          })
          .catch(err => {
            console.error(err);
          });
        getCoins().then(result => {
          setCoins(result);
        });
      }
    });
    perpetualContract.on("Withdraw", (value, user, asset) => {
      if (user === userAddress) {
        perpetualContract
          .getPortfolioValue(userAddress)
          .then(result => formatEther(result))
          .then(result => {
            setPortfolio(result);
          })
          .catch(err => {
            console.error(err);
          });
        getCoins().then(result => {
          setCoins(result);
        });
      }
    });
    perpetualContract.on(["sellQuoteLong", "buyQuoteLong"], result => {
      perpetualContract
        .getLongBalance(userAddress)
        .then(result => formatEther(result))
        .then(result => {
          setLongs(result);
        })
        .catch(err => {
          console.error(err);
        });
      perpetualContract
        .getUserMarginRatio(userAddress)
        .then(result => formatEther(result))
        .then(result => {
          setMarginRatio(result);
        })
        .catch(err => {
          console.error(err);
        });
      perpetualContract
        .getUnrealizedPnL(userAddress)
        .then(([amount, isPositive]) =>
          isPositive ? amount.toNumber() : -amount.toNumber()
        )
        .then(result => {
          setPnl(result);
        })
        .catch(err => {
          console.error(err);
        });
      perpetualContract
        .getEntryPrice(userAddress)
        .then(result => formatEther(result))
        .then(result => {
          setEntryPrice(result);
        })
        .catch(err => {
          console.error(err);
        });
    });
    perpetualContract.on(["sellQuoteShort", "buyQuoteShort"], result => {
      perpetualContract
        .getShortBalance(userAddress)
        .then(result => formatEther(result))
        .then(result => {
          setShorts(result);
        })
        .catch(err => {
          console.error(err);
        });
      perpetualContract
        .getUserMarginRatio(userAddress)
        .then(result => formatEther(result))
        .then(result => {
          setMarginRatio(result);
        })
        .catch(err => {
          console.error(err);
        });
      perpetualContract
        .getUnrealizedPnL(userAddress)
        .then(([amount, isPositive]) =>
          isPositive ? amount.toNumber() : -amount.toNumber()
        )
        .then(result => {
          setPnl(result);
        })
        .catch(err => {
          console.error(err);
        });
      perpetualContract
        .getEntryPrice(userAddress)
        .then(result => formatEther(result))
        .then(result => {
          setEntryPrice(result);
        })
        .catch(err => {
          console.error(err);
        });
    });
  };

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
      result.coins = await getCoins();
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
      initListeners();
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
      if (perpetualContract) {
        perpetualContract.removeAllListeners();
      }
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
