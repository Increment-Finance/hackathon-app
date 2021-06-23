import React from "react";
import { Container, CoinInput } from "../components";
import "./Dashboard.scss";

const COINS_LIST = [
  {
    name: "aUSDC",
    max: 1
  },
  {
    name: "USDC",
    max: 50
  }
];

export default function Dashboard() {
  return (
    <div className="dashboard-container">
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
          <Container className="deposits" title="Deposits / Withdraws">
            <CoinInput coins={COINS_LIST} title="Deposit" onChange={() => {}} />
            <CoinInput
              coins={COINS_LIST}
              title="Widthdraw"
              onChange={() => {}}
            />
          </Container>
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
    </div>
  );
}
