/* code from scaffold-eth (https://github.com/austintgriffith/scaffold-eth) */
/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { ethers } = require("hardhat");
const { utils } = require("ethers");
const { getChainlinkOracles } = require("../integrationAddresses/oracles.js");
const { getTokenAddresses } = require("../integrationAddresses/assets.js");
const { getAaveContracts } = require("../integrationAddresses/lendingPools.js");

const main = async () => {
  console.log("\n\n 📡 Deploying...\n");

  /************* DEPLOY CONTRACTS ******************/

  // vAMM parameters
  const vUSDreserve = utils.parseEther("900000"); // 900 000
  const vJPYreserve = utils.parseEther("100000000"); // 100 000 0000

  // Get chainlink oracles
  const chainlinkOracles = getChainlinkOracles("kovan");

  // Get reserve assets
  const reserveAssets = getTokenAddresses("kovan");

  // deploy
  await deploy("Perpetual", [
    vJPYreserve,
    vUSDreserve,
    chainlinkOracles.JPY_USD,
    [reserveAssets.USDC],
    [chainlinkOracles.USDC_USD],
    [false],
  ]);

  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );
};

const deploy = async (
  contractName,
  _args = [],
  overrides = {},
  libraries = {}
) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName, {
    libraries: libraries,
  });
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);

  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);

  let extraGasInfo = "";
  if (deployed && deployed.deployTransaction) {
    const gasUsed = deployed.deployTransaction.gasLimit.mul(
      deployed.deployTransaction.gasPrice
    );
    extraGasInfo = `${utils.formatEther(gasUsed)} ETH, tx hash ${
      deployed.deployTransaction.hash
    }`;
  }

  console.log(
    " 📄",
    chalk.cyan(contractName),
    "deployed to:",
    chalk.magenta(deployed.address)
  );
  console.log(" ⛽", chalk.grey(extraGasInfo));

  return deployed;
};

// ------ utils -------

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
