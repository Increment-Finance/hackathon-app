import React from "react";
import { formatUnits, parseEther } from "@ethersproject/units";
import addresses from "../utils/addresses";
import { Container, TransferWidget, NoWallet } from "../components";
import useContractBalances from "../hooks/useContractBalances";
import "./Dashboard.scss";

export default function Dashboard({
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  perpetualContract,
  userAddress,
  network,
}) {
  const { shorts, longs, pnl, marginRatio, portfolio } = useContractBalances(
    perpetualContract,
    userAddress,
    network
  );

  const redeemLong = () => {
    perpetualContract
      .RedeemLongQuote(addresses[network.name].supportedCollateral[0].address)
      .then((result) => {
        console.log("Closed Position Successfully", result);
      })
      .catch((err) => {
        console.error("Couldn't Close Position", err);
      });
  };
  const redeemShort = () => {
    perpetualContract
      .RedeemShortQuote(addresses[network.name].supportedCollateral[0].address)
      .then((result) => {
        console.log("Closed Position Successfully", result);
      })
      .catch((err) => {
        console.error("Couldn't Close Position", err);
      });
  };

  const formatShares = (shares) => {
    return Number(shares)
      .toFixed(2)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  return (
    <div className="dashboard-container">
      {provider ? (
        <div className="dashboard-content">
          <div className="row">
            <Container className="holdings" title="Holdings">
              <h1>${Number(portfolio)?.toFixed(5)}</h1>
              <div className="details">
                <div className="legend">
                  <p>Total Available</p>
                  <p>Total Locked</p>
                </div>
                <div className="values">
                  <p>$ -</p>
                  <p>$ -</p>
                </div>
              </div>
            </Container>
            <TransferWidget
              perpetualContract={perpetualContract}
              provider={provider}
              addresses={addresses}
              userAddress={userAddress}
              network={network}
            />
          </div>
          <div className="row">
            <Container className="positions" title="Open Positions">
              <table>
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Size (JPY)</th>
                    <th>Entry Price</th>
                    <th>Market Price</th>
                    <th>Margin</th>
                    <th>PNL</th>
                    <th>Close</th>
                  </tr>
                </thead>
                <tbody>
                  {(Number(shorts) > 0 || Number(longs) > 0) && (
                    <tr>
                      <td>JPY/USD</td>
                      <td>
                        {Number(shorts) > 0
                          ? formatShares(shorts)
                          : formatShares(longs)}
                      </td>
                      <td>???</td>
                      <td>???</td>
                      <td>{marginRatio}</td>
                      <td>{pnl}</td>
                      <td>
                        <button
                          onClick={
                            Number(shorts) > 0 ? redeemShort : redeemLong
                          }
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </Container>
          </div>
        </div>
      ) : (
        <NoWallet
          provider={provider}
          loadWeb3Modal={loadWeb3Modal}
          logoutOfWeb3Modal={logoutOfWeb3Modal}
        />
      )}
    </div>
  );
}
