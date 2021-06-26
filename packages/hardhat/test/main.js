const { expect } = require("chai");
const { utils } = require("ethers");

describe("Increment App", function () {


  // test data. Use BigNumber to avoid overflow
  const supply = utils.parseEther("100000000000000000000"); 
  const vUSDreserve = utils.parseEther("119000"); 
  const vEURreserve = utils.parseEther("100000"); 
  const depositAmount = utils.parseEther("100")

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
      expect(await usdc.balanceOf(owner.address)).to.be.equal(supply);
    });
    it("Should initialize vAMM pool", async function () {
      const pool = await perpetual.connect(owner).getPoolInfo();

      // correct reserve tokens
      expect(pool.vEUR).to.be.equal(vEURreserve);
      expect(pool.vUSD).to.be.equal(vUSDreserve);

      // check pool price
      const expectPrice = utils.parseEther((vUSDreserve / vEURreserve).toString()); // adjust for normalization by 10**18 in contract code
      expect(pool.price).to.be.equal(expectPrice);

      // check pool constant
      const normalizationConstant = 10**38; /// adjust by big number to avoid overflow error from chai library
      const expectTotalAssetReserve = vEURreserve * vUSDreserve / normalizationConstant;
      const realizedTotalAssetReserve = pool.totalAssetReserve / normalizationConstant
      expect(expectTotalAssetReserve).to.be.equal(realizedTotalAssetReserve);
    });
    it("Should initialize oracles", async function () {
      expect(await perpetual.connect(owner).getEUROracle()).to.be.equal(euro_oracle.address);
      expect(await perpetual.connect(owner).getAssetracle(usdc.address)).to.be.equal(usdc_oracle.address);
 
    });
    it("Should set reserve asset", async function () {
      const tokens = await perpetual.getReserveAssets();
      expect(tokens[0]).to.be.equal(usdc.address);
    });
    it("Should give owner role to deployer address", async function () {
      expect(await perpetual.owner()).to.be.equal(owner.address);

    });
  });
  describe("Can deposit and withdraw USDC", function () {
    it("Should give allowance to perpetual contract", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      const allowance = await usdc.allowance(owner.address, perpetual.address);
      expect(allowance).to.be.equal(depositAmount);

    });
    it("Should deposit USDC", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      const allowance = await usdc.allowance(owner.address, perpetual.address);
      expect(allowance).to.be.equal(depositAmount);
      await expect(perpetual.deposit(depositAmount, usdc.address))
        .to.emit(perpetual, 'Deposit')
        .withArgs(depositAmount, owner.address, usdc.address);

    });
    it("Should withdraw USDC", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.deposit(depositAmount, usdc.address)

      await expect(perpetual.withdraw(depositAmount, usdc.address))
      .to.emit(perpetual, 'Withdraw')
      .withArgs(depositAmount, owner.address, usdc.address);

      expect(await usdc.balanceOf(owner.address)).to.be.equal(supply);
        
    });
  });

  describe("Can buy assets on vAMM", function () {
    it("Should go long EURUSD", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.deposit(depositAmount, usdc.address);

      const mintAmount = utils.parseEther("5")
      await expect(perpetual.MintLongEUR(mintAmount))
      .to.emit(perpetual, 'buyEURUSDlong')
      .withArgs(mintAmount, owner.address);

    });
    it("Should go short EURUSD", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.deposit(depositAmount, usdc.address);

      const mintAmount = utils.parseEther("5")
      await expect(perpetual.MintShortEUR(mintAmount))
      .to.emit(perpetual, 'buyEURUSDshort')
      .withArgs(mintAmount, owner.address);

    });
    
  });



});        
