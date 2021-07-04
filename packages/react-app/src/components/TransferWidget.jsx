import React, { useState } from "react";
import { parseUnits, parseEther } from "@ethersproject/units";
import useTokenBalances from "../hooks/useTokenBalances";
import useContractBalances from "../hooks/useContractBalances";
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
  const { coins, shorts, longs } = useContractBalances(
    perpetualContract,
    userAddress,
    network
  );
  const [withdrawalCoin, setWithdrawalCoin] = useState();
  const [depositCoin, setDepositCoin] = useState();
  const [depositing, setDepositing] = useState(false);

  const withdraw = () => {
    if (
      withdrawalCoin.value <= withdrawalCoin.balance &&
      withdrawalCoin.value > 0
    ) {
      perpetualContract
        .withdraw(parseEther(withdrawalCoin.value), withdrawalCoin.address)
        .then(result => {
          console.log("Withdrawal Successful!", result);
        })
        .catch(err => {
          console.error("Withdrawal Failed!", err);
        });
    }
  };

  const deposit = () => {
    if (depositCoin.value <= depositCoin.balance && depositCoin.value > 0) {
      setDepositing(true);
      let amount = parseUnits(depositCoin.value, 6);
      approve(provider, depositCoin.address, amount, userAddress)
        .then(info => {
          perpetualContract
            .deposit(amount, depositCoin.address)
            .then(result => {
              setDepositing(false);
              console.log("Deposit Success!");
            })
            .catch(err => {
              console.error("Deposit Error!", err);
            });
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
        {shorts && longs && coins && (
          <CoinInput
            fixedValue={Number(shorts) > 0 || Number(longs) > 0 ? 0 : null}
            disabled={Number(shorts) > 0 || Number(longs) > 0}
            coins={coins}
            title="Withdraw"
            onChange={setWithdrawalCoin}
          />
        )}
        <button onClick={withdraw} className="red">
          Widthraw
        </button>
      </div>
    </Container>
  );
}
