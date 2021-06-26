const { utils } = require("@ethersproject/address");

function getChainlinkOracles(network) {
  const chainlinkOracle = {};

  if (network == "mainnet") {
    chainlinkOracle.EUR_USD = utils.getAddress(
      "0xb49f677943BC038e9857d61E7d053CaA2C1734C1"
    );
    chainlinkOracle.USDC_USD = utils.getAddress(
      "0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6"
    );
    chainlinkOracle.ETH_USD = utils.getAddress(
      "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"
    );
  } else if (network == "kovan") {
    chainlinkOracle.EUR_USD = utils.getAddress(
      "0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13"
    );
    chainlinkOracle.USDC_USD = utils.getAddress(
      "0x9211c6b3BF41A10F78539810Cf5c64e1BB78Ec60"
    );
    chainlinkOracle.ETH_USD = utils.getAddress(
      "0x9326BFA02ADD2366b30bacB125260Af641031331"
    );
  } else if (network == "rinkeby") {
    chainlinkOracle.EUR_USD = utils.getAddress(
      "0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F"
    );
    chainlinkOracle.USDC_USD = utils.getAddress(
      "0xa24de01df22b63d23Ebc1882a5E3d4ec0d907bFB"
    );
    chainlinkOracle.ETH_USD = utils.getAddress(
      "0x8A753747A1Fa494EC906cE90E9f37563A8AF630e"
    );
  } else if (network == "polygon") {
    chainlinkOracle.EUR_USD = utils.getAddress("");
    chainlinkOracle.USDC_USD = utils.getAddress(
      "0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F"
    );
    chainlinkOracle.ETH_USD = utils.getAddress(
      "0xF9680D99D6C9589e2a93a78A04A279e509205945"
    );
  } else {
    throw `Network ${network} is not supported `;
  }
  return chainlinkOracle;
}

module.exports = { getChainlinkOracles };
