import React from "react";
import { Button, Slider } from "antd";
import "./App.css";
import "antd/dist/antd.css";
import { Layout, Menu, Form, Input, Row, Col } from "antd";
import TradingViewWidget, { Themes } from "react-tradingview-widget";
import { Dropdown, message } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { Descriptions } from "antd";

const { Header, Content, Footer } = Layout;
const onClick = ({ key }) => {
  message.info(`Click on item ${key}`);
};

const menu = (
  <Menu onClick={onClick}>
    <Menu.Item key="1">1st menu item</Menu.Item>
    <Menu.Item key="2">2nd menu item</Menu.Item>
    <Menu.Item key="3">3rd menu item</Menu.Item>
  </Menu>
);

function App() {
  return (
    <Layout>
      <Header style={{ position: "fixed", zIndex: 1, width: "100%" }}>
        <div className="logo" />
        <Menu theme="dark" mode="horizontal" defaultSelectedKeys={["2"]}>
          <Menu.Item key="1">Trade</Menu.Item>
          <Menu.Item key="2">Staking</Menu.Item>
          <Menu.Item key="3">Rewards</Menu.Item>
        </Menu>
      </Header>
      <Content
        className="site-layout"
        style={{ padding: "0 50px", height: 1000, marginTop: 64 }}
      >
        <div
          className="site-layout-background"
          style={{ padding: 12, minHeight: 380 }}
        >
          <Dropdown overlay={menu}>
            <a
              href="/"
              className="ant-dropdown-link"
              onClick={(e) => e.preventDefault()}
            >
              EUR/USD <DownOutlined />
            </a>
          </Dropdown>
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
              <Slider
                defaultValue={3}
                disabled={false}
                max={10}
                marginTop={64}
              />
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
          theme={Themes.DARK}
          locale="fr"
          dateRange={12}
          width={800}
          height={400}
        />
      </Content>
      <Footer style={{ textAlign: "center" }}>Hedgit</Footer>
    </Layout>
  );
}

export default App;
