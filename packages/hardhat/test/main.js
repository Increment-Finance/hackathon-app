const { expect } = require("chai");
const { waffle } = require("hardhat");
const { utils } = require("ethers");


    /* Price feed: EUR/USD
     * Mainnet Address: 0xb49f677943BC038e9857d61E7d053CaA2C1734C1
     * Kovan Address: 0x0c15Ab9A0DB086e062194c273CC79f41597Bbf13
     * Rinkeby Address: 0x78F9e60608bF48a1155b4B2A5e31F32318a1d85F
     */

describe("Perpetual Protocol", function () {

  // test data. Use BigNumber to avoid overflow
  const supply = utils.parseEther("100000000000000000000"); 
  const vUSDreserve = utils.parseEther("119000"); 
  const vEURreserve = utils.parseEther("100000"); 
  const investAmount = utils.parseEther("100")

  // price oracle addresses are
  const euroChainlinkAddress = utils.getAddress("0xb49f677943BC038e9857d61E7d053CaA2C1734C1");

  // initialize contracts
  let usdc;
  let perpetual;
  let ownerAmount;

  beforeEach('Set up', async () => {

    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory("mockERC20");
    usdc = await USDC.connect(owner).deploy(supply, "USDC", "mockUSDC");

    const Perpetual = await ethers.getContractFactory("Perpetual");
    perpetual = await Perpetual.connect(owner).deploy(
      vEURreserve, 
      vUSDreserve, 
      euroChainlinkAddress, 
      [usdc.address], 
      [euroChainlinkAddress]
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
  });



});        
