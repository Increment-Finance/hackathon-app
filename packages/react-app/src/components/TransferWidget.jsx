import React, { useState, useEffect } from "react";
import { Container, CoinInput } from "./";
import { Contract } from "@ethersproject/contracts";
import { formatUnits } from "@ethersproject/units";
import erc20 from "../contracts/erc20.abi";
import "./TransferWidget.scss";

export const COINS_LIST = [];

export default function TransferWidget({
  provider,
  addresses,
  perpetualContract,
  userAddress
}) {
  const [aUSDCBalance, setaUSDCBalance] = useState(0);
  const [USDCBalance, setUSDCBalance] = useState(0);

  const withdraw = () => {};
  const deposit = () => {};

  useEffect(() => {
    let subscribed = true;
    if (provider && addresses) {
      // Get aUSDC Balance
      new Contract(addresses.aUSDC, erc20, provider)
        .balanceOf(userAddress)
        .then(result => {
          if (subscribed) {
            setaUSDCBalance(formatUnits(result, 6));
          }
        })
        .catch(err => {
          console.error(err);
        });
      // Get USDC Balance
      new Contract(addresses.USDC, erc20, provider)
        .balanceOf(userAddress)
        .then(result => {
          if (subscribed) {
            setUSDCBalance(formatUnits(result, 6));
          }
        })
        .catch(err => {
          console.error(err);
        });
    }
    return () => {
      subscribed = false;
    };
  }, [provider, addresses, userAddress]);

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
