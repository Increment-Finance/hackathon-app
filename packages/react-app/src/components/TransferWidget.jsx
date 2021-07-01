import React, { useState } from "react";
import { parseUnits } from "@ethersproject/units";
import useTokenBalances from "../hooks/useTokenBalances";
import approve from "../utils/approve";
import { Container, CoinInput } from "./";
import "./TransferWidget.scss";

export default function TransferWidget({
  provider,
  addresses,
  perpetualContract,
  userAddress,
  network
}) {
  const balances = useTokenBalances(provider, network, userAddress);
  const [widthdrawalCoin, setWithdrawalCoin] = useState();
  const [depositCoin, setDepositCoin] = useState();
  const [depositing, setDepositing] = useState(false);

  const withdraw = () => {};
  const deposit = () => {
    if (depositCoin.value <= depositCoin.balance && depositCoin.value > 0) {
      setDepositing(true);
      let amount = parseUnits(depositCoin.value, 6);
      approve(provider, depositCoin.address, amount, userAddress)
        .then(info => {
          setTimeout(() => {
            perpetualContract
              .deposit(amount, depositCoin.address)
              .then(result => {
                setDepositing(false);
                console.log("Deposit Success!");
              })
              .catch(err => {
                console.error("Deposit Error!", err);
              });
          }, 1000);
        })
        .catch(err => {
          console.error("Approval Error!", err);
        });
    }
  };

  return (
    <Container className="deposits" title="Deposits / Withdraws">
      <div className=" row">
        {balances &&
          (depositing ? (
            <div className="loader" />
          ) : (
            <CoinInput
              coins={balances}
              title="Deposit"
              onChange={setDepositCoin}
            />
          ))}
        <button onClick={deposit}>Deposit</button>
      </div>
      <div className=" row">
        {/* <CoinInput */}
        {/*   coins={} */}
        {/*   title="Widthdraw" */}
        {/*   onChange={() => {}} */}
        {/* /> */}
        <button onClick={withdraw} className="red">
          Widthraw
        </button>
      </div>
    </Container>
  );
}
