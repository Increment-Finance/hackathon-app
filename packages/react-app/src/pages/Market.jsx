import React, { useEffect, useState } from "react";
import { formatEther } from "@ethersproject/units";
import { BigNumber } from "@ethersproject/bignumber";
import { Form, Row, Col, Button, List } from "antd";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./Market.scss";
import { IFSlider, CoinInput, NoWallet } from "../components";
import useChainlinkPrice from "../hooks/useChainlinkPrice";
import useContractBalances from "../hooks/useContractBalances";

export default function Market({
  provider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  perpetualContract,
  userAddress,
  network,
}) {
  const [isLong, setIsLong] = useState(true);
  const [leverage, setLeverage] = useState(5);
  const [symbol, setSymbol] = useState("JPYUSD");
  const [poolPrice, setPoolPrice] = useState();
  const price = useChainlinkPrice("JPY", provider);
  const { shorts, longs, portfolio } = useContractBalances(
    perpetualContract,
    userAddress,
    network
  );

  const Symbols = { "JPY/USDC": "JPYUSD" };
  const formatPoolPrice = (price) => {
    if (price) {
      let etherBalance = formatEther(price.toString());
      let floatBalance = parseFloat(etherBalance);
      return floatBalance.toFixed(8);
    }
  };

  useEffect(() => {
    if (perpetualContract) {
      perpetualContract
        .getPoolPrice()
        .then((result) => {
          setPoolPrice(result.toString());
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }, [perpetualContract]);

  const openPosition = () => {
    if (perpetualContract && leverage && portfolio && portfolio > 0) {
      if (isLong) {
        perpetualContract
          .MintLongWithLeverage(leverage)
          .then(() => {
            console.log("Successfully Minted Long!");
          })
          .catch((err) => {
            console.error(err);
          });
      } else {
        perpetualContract
          .MintShortWithLeverage(leverage)
          .then(() => {
            console.log("Successfully Minted Short!");
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }
  };

  return (
    <div className="market-container">
      <div className="sidebar">
        {provider ? (
          <>
            <div>
              <p>
                Market Details <b>(JPY/USD)</b>
              </p>
            </div>
            <List
              bordered
              size="small"
              style={{ borderRadius: "10px", marginBottom: "30px" }}
            >
              <List.Item>
                <List.Item.Meta title={"Chainlink Price"}></List.Item.Meta>
                <div>{parseFloat(price).toFixed(8) || "-"}</div>
              </List.Item>
              <List.Item>
                <List.Item.Meta title={"Contract Price"}></List.Item.Meta>
                <div>{formatPoolPrice(poolPrice) || "-"}</div>
              </List.Item>
            </List>
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
                  flexGrow: 1,
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
                  flexGrow: 1,
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
                  coins={[
                    {
                      name: "USD",
                      balance: 0,
                    },
                  ]}
                  disabled
                  title="Collateral"
                  fixedValue={Number(portfolio)}
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
                  onSlide={(value) => setLeverage(value)}
                  isLong={isLong}
                />
              </Form.Item>
              <Form.Item>
                <div className="submit-box">
                  {Number(shorts) === 0 && Number(longs) === 0 ? (
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      style={{
                        background: isLong ? "#28A644" : "#E54848",
                        border: "1px solid #E5E5E5",
                        boxShadow: "none",
                        flexGrow: 1,
                        borderRadius: "10px",
                      }}
                      onClick={openPosition}
                    >
                      Submit
                    </Button>
                  ) : (
                    <p>Must have no open positions.</p>
                  )}
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
