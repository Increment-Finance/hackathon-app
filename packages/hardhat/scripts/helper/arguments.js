const { utils } = require("ethers");
const { getChainlinkOracles } = require("./oracles.js");
const { getTokenAddresses } = require("./assets.js");

// vAMM parameters
const vUSDreserve = utils.parseEther("900000"); // 900 000
const vJPYreserve = utils.parseEther("100000000"); // 100 000 0000

// Get chainlink oracles
const chainlinkOracles = getChainlinkOracles("kovan");

// Get reserve assets
const reserveAssets = getTokenAddresses("kovan");

const deployerArguments = [
  vJPYreserve.toString(),
  vUSDreserve.toString(),
  chainlinkOracles.JPY_USD,
  [reserveAssets.USDC],
  [chainlinkOracles.USDC_USD],
  [false],
];
console.log(deployerArguments);

module.exports = deployerArguments;
