import React, { useState } from "react";
import { Descriptions, Form, Input, Row, Col, Button, Slider } from "antd";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./Market.scss";

export default function Market() {
  const [isLong, setIsLong] = useState(true);

  return (
    <div className="market-container">
      <div className="sidebar">
        <Descriptions title="">
          <Descriptions.Item label="My Balance">0.00</Descriptions.Item>
        </Descriptions>
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
          <Form.Item
            label="Collateral"
            name="username"
            rules={[{ message: "Please input your username!" }]}
          >
            <Input placeholder="0.00" suffix="USDC" />
          </Form.Item>

          <Form.Item
            label="Position"
            name="password"
            rules={[{ message: "Please input your password!" }]}
          >
            <Input placeholder="0.00" suffix="EURO" />
          </Form.Item>

          <Form.Item>
            <Slider defaultValue={3} disabled={false} max={10} marginTop={64} />
          </Form.Item>
          <Form.Item>
            <div className="submit-box">
              <Button
                type="primary"
                htmlType="submit"
                style={{
                  background: isLong ? "#28A644" : "#E54848",
                  border: "1px solid #E5E5E5",
                  boxShadow: "none",
                  flexGrow: 1,
                }}
              >
                Submit
              </Button>
            </div>
          </Form.Item>
        </Form>
      </div>
      <TradingViewWidget
        symbol="FX:EURUSD"
        theme={Themes.Light}
        locale="en"
        dateRange={12}
        autosize
      />
    </div>
  );
}
