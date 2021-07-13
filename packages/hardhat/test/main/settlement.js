const { expect } = require("chai");
const { utils } = require("ethers");
const {
  deployContracts,
  forkContracts,
  testData,
} = require("../helper/init.js");

describe("Increment App: Funding rate", function () {
  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    //contracts = await deployContracts(data);
    contracts = await forkContracts(data);
  });

  describe("Funding", function () {
    it("Should update the funding rate and make long settlement ", async function () {
      await expect(contracts.perpetual.pushSnapshot());

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

      await contracts.perpetual.updateFundingRate();

      const fundingRate = await contracts.perpetual.getFundingRate();

      await contracts.perpetual.RedeemLongQuote(contracts.usdc.address);

      const usdcBalanceAfter = await contracts.perpetual.getReserveBalance(
        owner.address,
        contracts.usdc.address
      );

      const total = usdcBalanceAfter.add(fundingRate.value);
      expect(total).to.be.equal(utils.parseEther("99.999993835585888814")); //
    });
    it("Should update the funding rate and make short settlement ", async function () {
      await expect(contracts.perpetual.pushSnapshot());

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

      await contracts.perpetual.updateFundingRate();

      const fundingRate = await contracts.perpetual.getFundingRate();

      await contracts.perpetual.RedeemShortQuote(contracts.usdc.address);

      const usdcBalanceAfter = await contracts.perpetual.getReserveBalance(
        owner.address,
        contracts.usdc.address
      );

      const total = usdcBalanceAfter.add(fundingRate.value);
      expect(total).to.be.equal(utils.parseEther("99.999993835585888814")); //
    });
    105;
  });
});
