import React from "react";
import { Container, TransferWidget, NoWallet } from "../components";
import "./Dashboard.scss";

export default function Dashboard({
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  perpetualContract,
  addresses
}) {
  return (
    <div className="dashboard-container">
      {provider ? (
        <div className="dashboard-content">
          <div className="row">
            <Container className="holdings" title="Holdings">
              <h1>$0</h1>
              <div className="details">
                <div className="legend">
                  <p>Total Available</p>
                  <p>Total Locked</p>
                </div>
                <div className="values">
                  <p>$0</p>
                  <p>$0</p>
                </div>
              </div>
            </Container>
            <TransferWidget
              perpetualContract={perpetualContract}
              provider={provider}
              addresses={addresses}
            />
          </div>
          <div className="row">
            <Container className="positions" title="Positions">
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
                  <tr>
                    <td>EUR/USD</td>
                    <td>$23</td>
                    <td>1.24</td>
                    <td>1.87</td>
                    <td>0.43%</td>
                    <td>23%</td>
                    <td>
                      <button>Close</button>
                    </td>
                  </tr>
                  <tr>
                    <td>EUR/USD</td>
                    <td>$23</td>
                    <td>1.24</td>
                    <td>1.87</td>
                    <td>0.43%</td>
                    <td>23%</td>
                    <td>
                      <button>Close</button>
                    </td>
                  </tr>
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
