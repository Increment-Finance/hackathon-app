import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import "./LandingPage.scss";
import logo from "../assets/top_logo.png";
import button from "../assets/button1.png";
import button2 from "../assets/button2.png";

export default function Market({}) {
  const history = useHistory();
  const goTo = (href) => {
    history.push(href);
  };

  return (

    <div className="landing">
      <div className="topbar">

        <img className="topbar-img" src={logo} alt="Logo" />{" "}
        <button className="Docs" onClick={event =>  window.location.href='https://www.notion.so/Increment-Docs-576e18ba90c24fc38a9909f2e5589a9c'}
         >Docs
        </button>
        <img className="topbar-img"
          src={button}
          alt="button"
          onClick={() => {
            goTo("/market");
          }}
        />


      </div>

      <div className="content">

        <div className="title"> On-Chain Forex {"\n"} Derivatives Protocol </div>

        <p className="description">
          Empowering retail and institutional crypto holders including suppliers
          & borrowers {"\n"} on Aave to hedge against forex price movements.
        </p>
        <img
          className="img-button"
          src={button2}
          width={300}
          alt="button"
          onClick={event =>  window.location.href='https://www.notion.so/Increment-Docs-576e18ba90c24fc38a9909f2e5589a9c'}

        />
      </div>
    </div>
  );
}
