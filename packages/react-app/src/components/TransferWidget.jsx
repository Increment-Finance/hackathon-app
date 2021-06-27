import React, { useState, useEffect } from "react";
import { Container, CoinInput } from "./";
import "./TransferWidget.scss";

export const COINS_LIST = [];

export default function TransferWidget({
  provider,
  addresses,
  perpetualContract
}) {
  const [aUSDCBalance, setaUSDCBalance] = useState(0);
  const [USDCBalance, setUSDCBalance] = useState(0);

  const withdraw = () => {};
  const deposit = () => {};

  useEffect(() => {
    let subscribed = true;
    if (provider && addresses) {
      // Get aUSDC Balance
      provider
        .getBalance(addresses.aUSDC)
        .then(result => {
          if (subscribed) {
            setaUSDCBalance(result.toNumber());
          }
        })
        .catch(err => {
          console.error(err);
        });
      // Get USDC Balance
      provider
        .getBalance(addresses.USDC)
        .then(result => {
          if (subscribed) {
            setUSDCBalance(result.toNumber());
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
    return () => {
      subscribed = false;
    };
  }, [provider, addresses]);

  return (
    <Container className="deposits" title="Deposits / Withdraws">
      <div className=" row">
        <CoinInput
          coins={[
            {
              name: "aUSDC",
              max: aUSDCBalance
            },
            {
              name: "USDC",
              max: USDCBalance
            }
          ]}
          title="Deposit"
          onChange={() => {}}
        />
        <button onClick={deposit}>Deposit</button>
      </div>
      <div className=" row">
        <CoinInput
          coins={[
            {
              name: "aUSDC",
              max: aUSDCBalance
            },
            {
              name: "USDC",
              max: USDCBalance
            }
          ]}
          title="Widthdraw"
          onChange={() => {}}
        />
        <button onClick={withdraw} className="red">
          Widthraw
        </button>
      </div>
    </Container>
  );
}
