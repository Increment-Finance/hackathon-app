const { expect } = require("chai");
const { utils } = require("ethers");
const { deployContracts, testData } = require("../helper/init.js");

const { convertUSDCtoEther } = require("../helper/utility.js");

describe("Increment App: Minting / Redeeming", function () {
  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    contracts = await deployContracts(data);
  });

  describe("Can buy assets on vAMM", function () {
    it("Can go long Quote ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500");
      await expect(contracts.perpetual.connect(owner).MintLongQuote(mintAmount))
        .to.emit(contracts.perpetual, "buyQuoteLong")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55524.708495280399777902")
        );
      expect(
        await contracts.perpetual.getPortfolioValue(owner.address)
      ).to.be.equal(convertUSDCtoEther(data.depositAmount));

      console.log(
        "Entry price is",
        utils.formatEther(
          await contracts.perpetual.getEntryPrice(owner.address)
        )
      );
      console.log(
        "Current price is",
        utils.formatEther((await contracts.perpetual.getPoolInfo()).price)
      );
      console.log(
        "pool info is",
        (await contracts.perpetual.getPoolInfo()).toString()
      );
    });
    it("Can go short Quote ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500");

      await expect(
        contracts.perpetual.connect(owner).MintShortQuote(mintAmount)
      )
        .to.emit(contracts.perpetual, "buyQuoteShort")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55586.436909394107837687")
        );
    });
  });

  describe("Can redeem assets from vAMM", function () {
    it("Should sell long Quote", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);
      const mintAmount = utils.parseEther("500");
      await contracts.perpetual.connect(owner).MintLongQuote(mintAmount);
      //expect( ** ignore for now, getUnrealizedPnL() does distort result ***
      //  await contracts.perpetual.getUserMarginRatio(owner.address)
      //).to.be.equal(utils.parseEther("0.2")); // 100/500

      const longBalance = await contracts.perpetual.getLongBalance(
        owner.address
      );
      await contracts.perpetual.RedeemLongQuote(contracts.usdc.address);
    });
    it("Should sell short Quote", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);
      const mintAmount = utils.parseEther("500");
      await contracts.perpetual.connect(owner).MintShortQuote(mintAmount);
      //expect( ** ignore for now, getUnrealizedPnL() does distort result ***
      //  await contracts.perpetual.getUserMarginRatio(owner.address)
      //).to.be.equal(utils.parseEther("0.2")); // 100/500

      const shortBalanceBefore = await contracts.perpetual.getShortBalance(
        owner.address
      );
      await contracts.perpetual
        .connect(owner)
        .RedeemShortQuote(contracts.usdc.address);

      const shortBalanceAfter = await contracts.perpetual.getLongBalance(
        owner.address
      );
      //console.log("shortBalanceAfter is", shortBalanceAfter.toString());
    });
  });

  describe("Can buy assets on vAMM with leverage factor", function () {
    it("Can go long Quote with 5 times leverage ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500"); // 100 deposit & 5 leverage === 500 shares minted
      await expect(contracts.perpetual.connect(owner).MintLongWithLeverage(5))
        .to.emit(contracts.perpetual, "buyQuoteLong")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55524.708495280399777902")
        );
    });
    it("Can go short Quote with 5 times leverage ", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(owner)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmount = utils.parseEther("500");
      await expect(contracts.perpetual.connect(owner).MintShortWithLeverage(5))
        .to.emit(contracts.perpetual, "buyQuoteShort")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55586.436909394107837687")
        );
    });
  });
});
