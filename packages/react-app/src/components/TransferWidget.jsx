import React from "react";
import { Container, CoinInput } from "./";
import "./TransferWidget.scss";

const COINS_LIST = [
  {
    name: "aUSDC",
    max: 1
  },
  {
    name: "USDC",
    max: 50
  }
];

export default function TransferWidget() {
  const withdraw = () => {};
  const deposit = () => {};

  return (
    <Container className="deposits" title="Deposits / Withdraws">
      <div className=" row">
        <CoinInput coins={COINS_LIST} title="Deposit" onChange={() => {}} />
        <button onClick={deposit}>Deposit</button>
      </div>
      <div className=" row">
        <CoinInput coins={COINS_LIST} title="Widthdraw" onChange={() => {}} />
        <button onClick={withdraw} className="red">
          Widthraw
        </button>
      </div>
    </Container>
  );
}
