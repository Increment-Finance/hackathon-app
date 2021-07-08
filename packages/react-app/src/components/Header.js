import React, { useState, useEffect } from "react";
import { WalletButton } from ".";
import { useHistory, useLocation } from "react-router-dom";
import "./Header.scss";
import logo from "../assets/just logo.png";

export default function Header({
  address,
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
}) {
  const { pathname } = useLocation();
  const history = useHistory();
  const [ens, setEns] = useState();
  const displayAddress = address
    ? `${address.slice(0, 6)}...${address.slice(37, 41)}`
    : "";

  const goTo = (href) => {
    history.push(href);
  };

  useEffect(() => {
    let subscribed = true;
    if (provider && address) {
      provider
        .lookupAddress(address)
        .then((result) => {
          if (subscribed) {
            setEns(result);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
    return () => {
      subscribed = false;
    };
  }, [provider, address]);

    return (
    <div id="header">
      <h2
        className={`link ${pathname === "/" ? "selected" : ""}`}
        onClick={() => {
          goTo("/");
        }}
      >
      <img src={logo} height={40} width={40} alt="Logo" />

      </h2>

      <button
        className={`link ${pathname === "/market" ? "selected" : ""}`}
        onClick={() => {
          goTo("/market");
        }}
      >
        Market
      </button>
      <button
        className={`link ${pathname === "/dashboard" ? "selected" : ""}`}
        onClick={() => {
          goTo("/dashboard");
        }}
      >
        Dashboard
      </button>
      <p className="address">{ens || displayAddress}</p>
      <WalletButton
        provider={provider}
        loadWeb3Modal={loadWeb3Modal}
        logoutOfWeb3Modal={logoutOfWeb3Modal}
      />
    </div>
  );
}
