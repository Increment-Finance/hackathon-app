import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
// import { Contract } from "@ethersproject/contracts";
// import { getDefaultProvider } from "@ethersproject/providers";
import { useQuery } from "@apollo/react-hooks";
import useWeb3Modal from "./hooks/useWeb3Modal";
// import { addresses, abis } from "@project/contracts";
import GET_TRANSFERS from "./graphql/subgraph";
import { Header } from "./components";
import { Market, Dashboard } from "./pages";

import "./App.scss";
import "antd/dist/antd.css";

function App() {
  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [userAddress, setUserAddress] = useState(null);

  useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

  useEffect(() => {
    const signer = provider?.getSigner();
    if (signer) {
      signer
        .getAddress()
        .then(address => {
          setUserAddress(address);
        })
        .catch(err => {
          console.log("Couldn't get signer", err);
        });
    }
  }, [provider]);

  return (
    <div className="app">
      <Router>
        <Header
          address={userAddress}
          provider={provider}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
        />
        <Route path="/" exact>
          <Market
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
        </Route>
        <Route path="/dashboard">
          <Dashboard
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
        </Route>
      </Router>
    </div>
  );
}

export default App;
