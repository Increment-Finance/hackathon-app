const { expect } = require("chai");
const { waffle } = require("hardhat");
const { utils } = require("ethers");


describe("Perpetual Protocol", function () {

  // test data. Use BigNumber to avoid overflow
  const supply = utils.parseEther("100000000000000000000"); 
  const vUSDreserve = utils.parseEther("119000"); 
  const vEURreserve = utils.parseEther("100000"); 
  const investAmount = utils.parseEther("100")

  let usdc;
  let perpetual;
  let ownerAmount;

  beforeEach('Set up', async () => {

    [owner, user1, user2, ...addrs] = await ethers.getSigners();

    const USDC = await ethers.getContractFactory("USDC");
    usdc = await USDC.connect(owner).deploy(supply);

    const Perpetual = await ethers.getContractFactory("Perpetual");
    perpetual = await Perpetual.connect(owner).deploy(usdc.address, vUSDreserve, vEURreserve);

  });

  describe("Deployment", function () {
    it("Should given tokens with deployment ", async function () {
      ownerAmount = await usdc.balanceOf(owner.address);
      expect(ownerAmount).to.be.equal(supply);
    });
    it("Should given public variables ", async function () {
      const USDC = await perpetual.USDC();
      expect(USDC).to.be.equal(usdc.address);
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

      await expect(perpetual.depositUSDC(investAmount))
        .to.emit(perpetual, 'Deposit')
        .withArgs(investAmount, owner.address, 0);

    });
    it("Should withdraw USDC", async function () {
      await usdc.connect(owner).approve(perpetual.address, investAmount);
      await perpetual.depositUSDC(investAmount)

      await expect(perpetual.withdrawUSDC(investAmount))
      .to.emit(perpetual, 'Withdraw')
      .withArgs(investAmount, owner.address, 0);

      expect(ownerAmount).to.be.equal(supply);
        
    });
  });
  describe("Can buy assets on vAMM", function () {
    it("Should go long EURUSD", async function () {
      await usdc.connect(owner).approve(perpetual.address, investAmount);
      await perpetual.deposit(investAmount);

      await expect(perpetual.MintLongEUR(investAmount))
      .to.emit(perpetual, 'LongXAUminted')
      .withArgs(utils.parseEther("0.273631840796019901"), owner.address);

    });
  });



});        
