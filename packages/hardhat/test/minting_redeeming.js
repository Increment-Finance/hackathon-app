const { expect } = require("chai");
const { utils } = require("ethers");
const { deployContracts, testData } = require("./helper/init.js");

describe("Increment App", function () {
  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    contracts = await deployContracts(data);
  });

  describe("Can buy assets on vAMM", function () {
    it("Can go long EURUSD ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500");
      await expect(contracts.perpetual.connect(owner).MintLongEUR(mintAmount))
        .to.emit(contracts.perpetual, "buyEURUSDlong")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55524.708495280399777902")
        );
    });
    it("Can go short EURUSD ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500");

      await expect(contracts.perpetual.connect(owner).MintShortEUR(mintAmount))
        .to.emit(contracts.perpetual, "buyEURUSDshort")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55586.436909394107837687")
        );
    });
  });

  describe("Can redeem assets from vAMM", function () {
    it("Should sell long EURUSD", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);
      const mintAmount = utils.parseEther("500");
      await contracts.perpetual.connect(owner).MintLongEUR(mintAmount);
      expect(
        await contracts.perpetual.getUserMarginRatio(owner.address)
      ).to.be.equal(utils.parseEther("0.2")); // 100/500

      const longBalance = await contracts.perpetual.getLongBalance(
        owner.address
      );
      await contracts.perpetual.RedeemLongEUR(
        longBalance,
        contracts.usdc.address
      );
    });
    it("Should sell short EURUSD", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);
      const mintAmount = utils.parseEther("500");
      await contracts.perpetual.connect(owner).MintShortEUR(mintAmount);
      expect(
        await contracts.perpetual.getUserMarginRatio(owner.address)
      ).to.be.equal(utils.parseEther("0.2")); // 100/500

      const shortBalance = await contracts.perpetual.getShortBalance(
        owner.address
      );
      await contracts.perpetual
        .connect(owner)
        .RedeemShortEUR(shortBalance, contracts.usdc.address);
    });
  });

  describe("Can buy assets on vAMM with leverage factor", function () {
    it("Can go long EURUSD with 5 times leverage ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500"); // 100 deposit & 5 leverage === 500 shares minted
      await expect(contracts.perpetual.connect(owner).MintLongWithLeverage(5))
        .to.emit(contracts.perpetual, "buyEURUSDlong")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55524.708495280399777902")
        );
    });
    it("Can go short EURUSD with 5 times leverage ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500");
      await expect(contracts.perpetual.connect(owner).MintShortWithLeverage(5))
        .to.emit(contracts.perpetual, "buyEURUSDshort")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55586.436909394107837687")
        );
    });
  });
});
