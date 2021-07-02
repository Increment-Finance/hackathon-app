const { utils } = require("ethers");

const {
  getChainlinkOracles,
} = require("../../integrationAddresses/oracles.js");
const { getTokenAddresses } = require("../../integrationAddresses/assets.js");
const {
  getAaveContracts,
} = require("../../integrationAddresses/lendingPools.js");

const { occupyUSDC, occupyAUSDC } = require("../helper/impersonateAddress.js");

// uses mock contracs // mock oracles for tests
const deployContracts = async (data) => {
  let contracts = {};

  [owner, bob, alice, ...addrs] = await ethers.getSigners();

  // Chainlink oracles
  const decimals = 8;
  const initialPrice = utils.parseUnits("1", decimals);
  const ChainlinkOracle = await ethers.getContractFactory("MockV3Aggregator");
  contracts.jpy_oracle = await ChainlinkOracle.connect(owner).deploy(
    8,
    initialPrice
  );
  contracts.usdc_oracle = await ChainlinkOracle.connect(owner).deploy(
    8,
    initialPrice
  );

  // USDC reserve
  const USDC = await ethers.getContractFactory("mockERC20");
  contracts.usdc = await USDC.connect(owner).deploy(
    data.supply,
    "USDC",
    "mockUSDC",
    6
  );

  // Deploy Perpetual
  contracts.perpetual = await deployPerpetual(contracts, data);

  await contracts.perpetual.setReserveToken(
    contracts.usdc.address,
    contracts.usdc_oracle.address,
    false,
    contracts.usdc.address
  );

  return contracts;
};

// uses mainnet forking for tests
const forkContracts = async (data) => {
  let contracts = {};

  [owner, bob, alice, ...addrs] = await ethers.getSigners();

  // Chainlink oracles
  contracts.jpy_oracle = await ethers.getContractAt(
    "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol:MockV3Aggregator",
    getChainlinkOracles("mainnet").JPY_USD
  );
  contracts.usdc_oracle = await ethers.getContractAt(
    "@chainlink/contracts/src/v0.6/tests/MockV3Aggregator.sol:MockV3Aggregator",
    getChainlinkOracles("mainnet").USDC_USD
  );

  // Get reserve assets
  contracts.usdc = await ethers.getContractAt(
    "@aave/protocol-v2/contracts/protocol/tokenization/AToken.sol:AToken",
    getTokenAddresses("mainnet").USDC
  );
  await occupyUSDC(owner, data.supply); // give some intitial tokens

  contracts.ausdc = await ethers.getContractAt(
    "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
    getTokenAddresses("mainnet").aUSDC
  );
  await occupyAUSDC(owner, data.supply); // give some intitial tokens

  // Perpetual
  contracts.perpetual = await deployPerpetual(contracts, data);

  // set reserve tokens
  await contracts.perpetual.setReserveToken(
    contracts.usdc.address,
    contracts.usdc_oracle.address,
    false,
    contracts.usdc.address
  );

  await contracts.perpetual.setReserveToken(
    contracts.ausdc.address,
    contracts.usdc_oracle.address,
    true,
    contracts.usdc.address
  );

  return contracts;
};

const deployPerpetual = async (contracts, data) => {
  let perpetual;

  // Perpetual
  const Perpetual = await ethers.getContractFactory("Perpetual");
  perpetual = await Perpetual.connect(owner).deploy(
    data.vJPYreserve,
    data.vUSDreserve,
    contracts.jpy_oracle.address,
    getAaveContracts("mainnet").LendingPoolAddressesProvider
  );

  return perpetual;
};

const testData = () => {
  const testData = {};
  testData.supply = utils.parseUnits("100000", 6);
  testData.vUSDreserve = utils.parseEther("900000"); // 900 000
  testData.vJPYreserve = utils.parseEther("100000000"); // 100 000 0000
  testData.depositAmount = utils.parseUnits("100", 6); // USDC has 6 decimals
  return testData;
};

module.exports = { deployContracts, forkContracts, testData };
