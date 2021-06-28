const { utils } = require("ethers");

const deployContracts = async (data) => {
  let contracts = {};

  [owner, bob, alice, ...addrs] = await ethers.getSigners();

  // initialize contracts
  let usdc, perpetual, euro_oracle, usdc_oracle;

  const ChainlinkOracle = await ethers.getContractFactory("MockV3Aggregator");
  contracts.euro_oracle = await ChainlinkOracle.connect(owner).deploy(8, 1);
  contracts.usdc_oracle = await ChainlinkOracle.connect(owner).deploy(8, 1);

  // USDC reserve
  const USDC = await ethers.getContractFactory("mockERC20");
  contracts.usdc = await USDC.connect(owner).deploy(
    data.supply,
    "USDC",
    "mockUSDC"
  );

  // Perpetual
  const Perpetual = await ethers.getContractFactory("Perpetual");
  contracts.perpetual = await Perpetual.connect(owner).deploy(
    data.vEURreserve,
    data.vUSDreserve,
    contracts.euro_oracle.address,
    [contracts.usdc.address],
    [contracts.usdc_oracle.address]
  );
  return contracts;
};

const testData = () => {
  const testData = {};
  testData.supply = utils.parseEther("100000000000000000000");
  testData.vUSDreserve = utils.parseEther("900000"); // 900 000
  testData.vEURreserve = utils.parseEther("100000000"); // 100 000 0000
  testData.depositAmount = utils.parseEther("100");
  return testData;
};

module.exports = { deployContracts, testData };
