import React from "react";
import { Descriptions, Form, Input, Row, Col, Button, Slider } from "antd";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import "./Market.scss";

export default function Market() {
  return (
    <div className="market-container">
      <div className="sidebar">
        <Descriptions title="">
          <Descriptions.Item label="My Balance">0.00</Descriptions.Item>
        </Descriptions>
        <Button type="primary" shape="round" size={10}>
          BUY/LONG
        </Button>
        &nbsp;&nbsp;&nbsp;
        <Button type="primary" shape="round" size={10}>
          SELL/SHORT
        </Button>
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
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
      <TradingViewWidget
        symbol="FX:EURUSD"
        theme={Themes.Light}
        locale="fr"
        dateRange={12}
        autosize
      />
    </div>
  );
}
