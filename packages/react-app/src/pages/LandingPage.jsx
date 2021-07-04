import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import "./LandingPage.scss";
import logo from "../assets/top_logo.png";
import button from "../assets/button1.png";

export default function Market({}) {
  const history = useHistory();

  const goTo = (href) => {
    history.push(href);
  };

  return (
    <div className="landing">
      <div className="topbar">
        <img src={logo} height={80} alt="Logo" />{" "}
        <img
          className="img-button"
          src={button}
          height={80}
          alt="button"
          onClick={() => {
            goTo("/market");
          }}
        />
      </div>
      <div className="content">
        <h1 className="title"> On-Chain Forex Derivatives Protocol </h1>
        <p className="description">
          Empowering retail and institutional crypto holders including suppliers
          & borrowers on Aave to hedge against forex price movements.
        </p>
        <img
          className="img-button"
          src={button}
          width={300}
          alt="button"
          onClick={() => {
            goTo("/market");
          }}
        />
      </div>
    </div>
  );
}
