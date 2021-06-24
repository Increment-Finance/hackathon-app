import logo from '../Images/Vector.png';
import "./nowallet.css"
import { Typography } from 'antd';
import useWeb3Modal from "../hooks/useWeb3Modal";
import { useQuery } from "@apollo/react-hooks";
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import GET_TRANSFERS from "../graphql/subgraph";
import {  Dashboard} from "../pages";




const { Title } = Typography;

export default function NoWallet() {

  const { loading, error, data } = useQuery(GET_TRANSFERS);
  const [provider, loadWeb3Modal, logoutOfWeb3Modal] = useWeb3Modal();
  const [userAddress, setUserAddress] = useState(null);


  useEffect(() => {
    if (!loading && !error && data && data.transfers) {
      console.log({ transfers: data.transfers });
    }
  }, [loading, error, data]);

var signer = false;
  useEffect(() => {
    signer = provider?.getSigner();
    if (signer) {
      signer
        .getAddress()
        .then((address) => {
          setUserAddress(address);
        })
        .catch((err) => {
          console.log("Couldn't get signer", err);
        });
    }else{
      console.log("Couldn't get signer");
    }
  }, [provider]);

    if(signer = provider?.getSigner()) {
       return (
        <Dashboard />
        );
    }else{
       return (
         <div className="primary">
         <img src={logo} alt="Logo" />
         <Title level={5} margin={40} >No Wallet Detected</Title>
         </div>
      );

}
}
