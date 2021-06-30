import React from "react";
import { formatUnits } from "@ethersproject/units";
import { Container, TransferWidget, NoWallet } from "../components";
import useContractBalances from "../hooks/useContractBalances";
import "./Dashboard.scss";

export default function Dashboard({
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  perpetualContract,
  addresses,
  userAddress,
  network
}) {
  const { shorts, longs, pnl, marginRatio, portfolio } = useContractBalances(
    perpetualContract,
    userAddress,
    network
  );

  const redeemLong = () => {};
  const redeemShort = () => {};

  return (
    <div className="dashboard-container">
      {provider ? (
        <div className="dashboard-content">
          <div className="row">
            <Container className="holdings" title="Holdings">
              <h1>${portfolio?.toFixed(5)}</h1>
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
                    <th>Size</th>
                    <th>Entry Price</th>
                    <th>Market Price</th>
                    <th>Margin</th>
                    <th>PNL</th>
                    <th>Close</th>
                  </tr>
                </thead>
                <tbody>
                  {(shorts > 0 || longs > 0) && (
                    <tr>
                      <td>EUR/USD</td>
                      <td>{shorts > 0 ? shorts : longs}</td>
                      <td>???</td>
                      <td>???</td>
                      <td>{marginRatio}</td>
                      <td>{pnl}</td>
                      <td>
                        <button onClick={shorts > 0 ? redeemShort : redeemLong}>
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
