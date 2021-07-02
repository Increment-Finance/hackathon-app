const { expect } = require("chai");
const { utils } = require("ethers");
const {
  deployContracts,
  forkContracts,
  testData,
} = require("../helper/init.js");
const { convertUSDCtoEther } = require("../helper/utility.js");

describe("Increment App: Reserve // ATokens test", function () {
  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    contracts = await forkContracts(data);
  });

  describe("Can deposit and withdraw USDC", function () {
    it("Should give allowance to contracts.perpetual contract", async function () {
      await contracts.ausdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      const allowance = await contracts.ausdc.allowance(
        owner.address,
        contracts.perpetual.address
      );
      expect(allowance).to.be.equal(data.depositAmount);
    });
    it("Should deposit aUSDC", async function () {
      await contracts.ausdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);

      const allowance = await contracts.ausdc.allowance(
        owner.address,
        contracts.perpetual.address
      );

      expect(allowance).to.be.equal(data.depositAmount);
      await expect(
        contracts.perpetual.deposit(data.depositAmount, contracts.ausdc.address)
      )
        .to.emit(contracts.perpetual, "Deposit")
        .withArgs(data.depositAmount, owner.address, contracts.ausdc.address);

      const expectedAssetValue = convertUSDCtoEther(data.depositAmount);
      console.log(
        "Mean asset value is",
        utils.formatEther(expectedAssetValue.toString())
      );

      const assetValue = await contracts.perpetual.getAssetValue(
        owner.address,
        contracts.ausdc.address
      );
      /*
      console.log("assetValue is", utils.formatEther(assetValue));
      expect(assetValue).to.be.within(
        expectedAssetValue - utils.parseEther("0.01"),
        expectedAssetValue + utils.parseEther("0.01")
      );
      console.log("after getAssetValue");
      expect(
        await contracts.perpetual.getPortfolioValue(owner.address)
      ).to.be.within(
        expectedAssetValue - utils.parseEther("0.01"),
        expectedAssetValue + utils.parseEther("0.01")
      );
      console.log("after getPortfolioValue");
      */
    });
    it("Should withdraw aUSDC", async function () {
      await contracts.ausdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual.deposit(
        data.depositAmount,
        contracts.ausdc.address
      );

      await expect(
        contracts.perpetual.withdraw(
          convertUSDCtoEther(data.depositAmount),
          contracts.ausdc.address
        )
      )
        .to.emit(contracts.perpetual, "Withdraw")
        .withArgs(
          convertUSDCtoEther(data.depositAmount),
          owner.address,
          contracts.ausdc.address
        );
    });
  });
});
