const { utils } = require("ethers");

const deployContracts = async (data) => {
  let contracts = {};

  [owner, bob, alice, ...addrs] = await ethers.getSigners();

  // Chainlink oracles
  const decimals = 8;
  const initialPrice = utils.parseUnits("1", decimals);
  const ChainlinkOracle = await ethers.getContractFactory("MockV3Aggregator");
  contracts.euro_oracle = await ChainlinkOracle.connect(owner).deploy(
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

  // Perpetual
  const Perpetual = await ethers.getContractFactory("Perpetual");
  contracts.perpetual = await Perpetual.connect(owner).deploy(
    data.vEURreserve,
    data.vUSDreserve,
    contracts.euro_oracle.address,
    [contracts.usdc.address],
    [contracts.usdc_oracle.address],
    [false]
  );
  return contracts;
};

const testData = () => {
  const testData = {};
  testData.supply = utils.parseEther("100000000000000000000");
  testData.vUSDreserve = utils.parseEther("900000"); // 900 000
  testData.vEURreserve = utils.parseEther("100000000"); // 100 000 0000
  testData.depositAmount = utils.parseUnits("100", 6); // USDC has 6 decimals
  return testData;
};

const convertUSDCtoEther = (number) => {
  const numString = utils.formatUnits(number, 6);
  return utils.parseEther(numString);
};

module.exports = { deployContracts, testData, convertUSDCtoEther };
