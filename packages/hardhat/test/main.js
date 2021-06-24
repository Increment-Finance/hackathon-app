const { expect } = require("chai");
const { utils } = require("ethers");

describe("Increment App", function () {


  // test data. Use BigNumber to avoid overflow
  const supply = utils.parseEther("100000000000000000000"); 
  const vUSDreserve = utils.parseEther("119000"); 
  const vEURreserve = utils.parseEther("100000"); 
  const investAmount = utils.parseEther("100")

  // initialize contracts
  let usdc, perpetual, ownerAmount, euro_oracle, usdc_oracle;

  beforeEach('Set up', async () => {

    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    // Mock Chainlink Oracles
    const ChainlinkOracle = await ethers.getContractFactory("MockV3Aggregator");
    euro_oracle = await ChainlinkOracle.connect(owner).deploy(8, 1);
    usdc_oracle = await ChainlinkOracle.connect(owner).deploy(8, 1);

    // USDC reserve
    const USDC = await ethers.getContractFactory("mockERC20");
    usdc = await USDC.connect(owner).deploy(supply, "USDC", "mockUSDC");

    // Perpetual 
    const Perpetual = await ethers.getContractFactory("Perpetual");
    perpetual = await Perpetual.connect(owner).deploy(
      vEURreserve, 
      vUSDreserve, 
      euro_oracle.address, 
      [usdc.address], 
      [usdc_oracle.address]
      );

  });

  describe("Deployment", function () {
    it("Should given tokens with deployment ", async function () {
      ownerAmount = await usdc.balanceOf(owner.address);
      expect(ownerAmount).to.be.equal(supply);
    });
    it("Should set USDC as reserve asset", async function () {
      const tokens = await perpetual.getReserveAssets();
      expect(tokens[0]).to.be.equal(usdc.address);
    });
    it("Should give owner to deployer address ", async function () {
      const contractOwner = await perpetual.owner();
      expect(contractOwner).to.be.equal(owner.address);
    });
  });
  describe("Can deposit and withdraw USDC", function () {
    it("Should give allowance to perpetual contrac", async function () {
      await usdc.connect(owner).approve(perpetual.address, investAmount);
      const allowance = await usdc.allowance(owner.address, perpetual.address);
      expect(allowance).to.be.equal(investAmount);

    });
    it("Should deposit USDC", async function () {
      await usdc.connect(owner).approve(perpetual.address, investAmount);
      const allowance = await usdc.allowance(owner.address, perpetual.address);
      expect(allowance).to.be.equal(investAmount);

      await expect(perpetual.deposit(investAmount, usdc.address))
        .to.emit(perpetual, 'Deposit')
        .withArgs(investAmount, owner.address, usdc.address);

    });
    it("Should withdraw USDC", async function () {
      await usdc.connect(owner).approve(perpetual.address, investAmount);
      await perpetual.deposit(investAmount, usdc.address)

      await expect(perpetual.withdraw(investAmount, usdc.address))
      .to.emit(perpetual, 'Withdraw')
      .withArgs(investAmount, owner.address, usdc.address);

      expect(ownerAmount).to.be.equal(supply);
        
    });
  });
  describe("Can buy assets on vAMM", function () {
    it("Should go long EURUSD", async function () {
      await usdc.connect(owner).approve(perpetual.address, investAmount);
      await perpetual.deposit(investAmount, usdc.address);

      await expect(perpetual.MintLongEUR(investAmount))
      .to.emit(perpetual, 'buyEURUSDlong')
      .withArgs(utils.parseEther("100"), owner.address);

    });
    it("Should go short EURUSD", async function () {
      await usdc.connect(owner).approve(perpetual.address, investAmount);
      await perpetual.deposit(investAmount, usdc.address);

      await expect(perpetual.MintShortEUR(investAmount))
      .to.emit(perpetual, 'buyEURUSDshort')
      .withArgs(utils.parseEther("100"), owner.address);

    });
  });



});        
