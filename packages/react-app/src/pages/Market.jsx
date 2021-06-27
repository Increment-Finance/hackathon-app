import React, { useState } from "react";
import { Form, Row, Col, Button, List } from "antd";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./Market.scss";
import { IFSlider, CoinInput, NoWallet } from "../components";
import useChainlinkPrice from "../hooks/useChainlinkPrice";

const COINS_LIST = [];

export default function Market({ provider, loadWeb3Modal, logoutOfWeb3Modal }) {
  const [isLong, setIsLong] = useState(true);
  const [leverage, setLeverage] = useState(5);
  const [symbol, setSymbol] = useState("FX:EURUSD");
  const price = useChainlinkPrice("EUR", provider);

  const Symbols = { "EUR/USDC": "FX:EURUSD" };

  const DetailItems = [
    "Entry Price",
    "Price Impact",
    "Transaction Fee",
    "Total Cost"
  ];

  return (
    <div className="market-container">
      <div className="sidebar">
        {provider ? (
          <>
            <div className="symbol-select-container">
              <h1 style={{ marginBottom: 0 }}>{price}</h1>
              <select
                className="symbol-select"
                id="symbol-select"
                onChange={e => {
                  setSymbol(e.nativeEvent.target.value);
                }}
              >
                {Object.entries(Symbols).map(([key, value]) => (
                  <option value={value} key={key}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <hr style={{ marginBottom: "30px", backgroundColor: "#E5E5E5" }} />
            <div className="long-short-box">
              <Button
                type="text"
                shape="round"
                style={{
                  background: isLong ? "#28A644" : "#FFFFFF",
                  color: isLong ? "#FFFFFF" : "#000000",
                  borderRadius: "25px 0px 0px 25px",
                  border: "1px solid #E5E5E5",
                  borderRight: "none",
                  boxShadow: "none",
                  flexGrow: 1
                }}
                onClick={() => setIsLong(true)}
              >
                Long
              </Button>
              <Button
                type="text"
                shape="round"
                style={{
                  background: isLong ? "#FFFFFF" : "#E54848",
                  color: isLong ? "#000000" : "#FFFFFF",
                  borderRadius: "0px 25px 25px 0px",
                  border: "1px solid #E5E5E5",
                  borderLeft: "none",
                  boxShadow: "none",
                  flexGrow: 1
                }}
                onClick={() => setIsLong(false)}
              >
                Short
              </Button>
            </div>
            <Row gutter={[40, 16]}>
              <Col span={6} />
              <Col span={6} />
              <Col span={6} />
              <Col span={6} />
              <Col span={6} />
              <Col span={6} />
              <Col span={6} />
              <Col span={6} />
            </Row>
            <Form>
              <Form.Item>
                <CoinInput
                  coins={COINS_LIST}
                  title="Collateral"
                  onChange={() => {}}
                />
              </Form.Item>

              <div>
                <p>
                  Leverage{" "}
                  <span style={{ color: "#999999" }}>({leverage}x)</span>
                </p>
              </div>
              <Form.Item>
                <IFSlider
                  min={1}
                  max={10}
                  defaultValue={leverage}
                  onSlide={value => setLeverage(value)}
                  isLong={isLong}
                />
              </Form.Item>
              <div>
                <p>Details</p>
              </div>
              <List
                bordered
                dataSource={DetailItems}
                size="small"
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta title={item}></List.Item.Meta>
                    <div>-</div>
                  </List.Item>
                )}
                style={{ borderRadius: "10px", marginBottom: "30px" }}
              />
              <Form.Item>
                <div className="submit-box">
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    style={{
                      background: isLong ? "#28A644" : "#E54848",
                      border: "1px solid #E5E5E5",
                      boxShadow: "none",
                      flexGrow: 1,
                      borderRadius: "10px"
                    }}
                  >
                    Submit
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </>
        ) : (
          <NoWallet
            provider={provider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
          />
        )}
      </div>
      <TradingViewWidget
        symbol={symbol}
        theme={Themes.Light}
        locale="en"
        dateRange={12}
        autosize
      />
    </div>
  );
}
