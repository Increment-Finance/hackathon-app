/* code from scaffold-eth (https://github.com/austintgriffith/scaffold-eth) */
/* eslint no-use-before-define: "warn" */
const fs = require("fs");
const chalk = require("chalk");
const { config, ethers, tenderly, run } = require("hardhat");
const { utils } = require("ethers");
const R = require("ramda");
const { getChainlinkOracles } = require("./helper/oracles.js")

const main = async () => {

  console.log("\n\n 📡 Deploying...\n");


  /************* DEPLOY CONTRACTS ******************/


  // test data. Use BigNumber to avoid overflow
  const supply = utils.parseEther("100000000000000000000"); 
  const vUSDreserve = utils.parseEther("119000"); 
  const vEURreserve = utils.parseEther("100000"); 
  const investAmount = utils.parseEther("100")
  
  // Get chainlink oracles
  const chainlinkOracles = getChainlinkOracles("rinkeby");
  const euro_oracle = chainlinkOracles.EUR_USD;
  const usdc_oracle = chainlinkOracles.USDC_USD;
  
  // deploy contracts
  const usdc = await deploy("mockERC20",
  [  
    supply, 
    "USDC", 
    "mockUSDC"
  ]
  );

  const perpetual = await deploy("Perpetual", 
  [ 
    vEURreserve, 
    vUSDreserve, 
    euro_oracle, 
    [usdc.address], 
    [usdc_oracle]
  ] 
  );

  // approve spending
  const deployerWallet = ethers.provider.getSigner()
  await usdc.connect(deployerWallet).approve(perpetual.address, investAmount);


  console.log(
    " 💾  Artifacts (address, abi, and args) saved to: ",
    chalk.blue("packages/hardhat/artifacts/"),
    "\n\n"
  );
};

const deploy = async (contractName, _args = [], overrides = {}, libraries = {}) => {
  console.log(` 🛰  Deploying: ${contractName}`);

  const contractArgs = _args || [];
  const contractArtifacts = await ethers.getContractFactory(contractName,{libraries: libraries});
  const deployed = await contractArtifacts.deploy(...contractArgs, overrides);

  fs.writeFileSync(`artifacts/${contractName}.address`, deployed.address);
  
  let extraGasInfo = ""
  if(deployed&&deployed.deployTransaction){
    const gasUsed = deployed.deployTransaction.gasLimit.mul(deployed.deployTransaction.gasPrice)
    extraGasInfo = `${utils.formatEther(gasUsed)} ETH, tx hash ${deployed.deployTransaction.hash}`
  }

  console.log(
    " 📄",
    chalk.cyan(contractName),
    "deployed to:",
    chalk.magenta(deployed.address)
  );
  console.log(
    " ⛽",
    chalk.grey(extraGasInfo)
  );

  return deployed;
};


// ------ utils -------

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
