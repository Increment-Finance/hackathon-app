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

  describe("Can deposit and withdraw USDC", function () {
    it("Should give allowance to contracts.perpetual contract", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      const allowance = await contracts.usdc.allowance(
        owner.address,
        contracts.perpetual.address
      );
      expect(allowance).to.be.equal(data.depositAmount);
    });
    it("Should deposit USDC", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      const allowance = await contracts.usdc.allowance(
        owner.address,
        contracts.perpetual.address
      );
      expect(allowance).to.be.equal(data.depositAmount);
      await expect(
        contracts.perpetual.deposit(data.depositAmount, contracts.usdc.address)
      )
        .to.emit(contracts.perpetual, "Deposit")
        .withArgs(data.depositAmount, owner.address, contracts.usdc.address);

      expect(
        await contracts.perpetual.getAssetValue(
          owner.address,
          contracts.usdc.address
        )
      ).to.be.equal(data.depositAmount);

      expect(
        await contracts.perpetual.getPortfolioValue(owner.address)
      ).to.be.equal(data.depositAmount);
      console.log(
        "Portfolio value is",
        utils.formatEther(
          await contracts.perpetual.getPortfolioValue(owner.address)
        )
      );
    });
    it("Should withdraw USDC", async function () {
      await contracts.usdc
        .connect(owner)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual.deposit(
        data.depositAmount,
        contracts.usdc.address
      );

      await expect(
        contracts.perpetual.withdraw(data.depositAmount, contracts.usdc.address)
      )
        .to.emit(contracts.perpetual, "Withdraw")
        .withArgs(data.depositAmount, owner.address, contracts.usdc.address);

      expect(await contracts.usdc.balanceOf(owner.address)).to.be.equal(
        data.supply
      );
    });
  });
});
