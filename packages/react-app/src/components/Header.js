import React from "react";
import { WalletButton } from ".";
import { useHistory, useLocation } from "react-router-dom";
import "./Header.scss";
import logo from '../assets/just logo.png';


export default function Header({
  address,
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal
}) {
  const { pathname } = useLocation();
  const history = useHistory();
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(37, 41)}`
    : "";

  const goTo = href => {
    history.push(href);
  };

  return (
    <div id="header">

    <h2 className="box" >
      <img src={logo} height={40} width={40}  alt="Logo" />
    </h2>

      <h2
        className={`link ${pathname === "/" ? "selected" : ""}`}
        onClick={() => {
          goTo("/");
        }}
      >
        Market
      </h2>
      <h2
        className={`link ${pathname === "/dashboard" ? "selected" : ""}`}
        onClick={() => {
          goTo("/dashboard");
        }}
      >
        Dashboard
      </h2>
      <p className="address">{displayAddress}</p>
      <WalletButton
        provider={provider}
        loadWeb3Modal={loadWeb3Modal}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
      />
    </div>
  );
}
