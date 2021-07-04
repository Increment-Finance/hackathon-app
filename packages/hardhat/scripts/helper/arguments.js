const { utils } = require("ethers");
const {
  getChainlinkOracles,
} = require("../../integrationAddresses/oracles.js");
const {
  getAaveContracts,
} = require("../../integrationAddresses/lendingPools.js");

// vAMM parameters
const vUSDreserve = utils.parseEther("900000"); // 900 000
const vJPYreserve = utils.parseEther("100000000"); // 100 000 0000

const deployerArguments = [
  vJPYreserve,
  vUSDreserve,
  getChainlinkOracles("kovan").JPY_USD,
  getAaveContracts("kovan").LendingPoolAddressesProvider,
];
console.log(deployerArguments);

module.exports = deployerArguments;
