import React from "react";
import { WalletButton } from "./";
import walletImg from "../assets/wallet.png";
import "./NoWallet.scss";

export default function NoWallet({
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal
}) {
  return (
    <div className="no-wallet-warning">
      <img alt="wallet" src={walletImg} />
      <h2>No Wallet Connected</h2>
      <WalletButton
        provider={provider}
        loadWeb3Modal={loadWeb3Modal}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
      />
    </div>
  );
}
