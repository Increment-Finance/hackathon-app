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
    it("Should take a snapshot of vAMM price ", async function () {
      const expectedPrice = (data.vUSDreserve * 10 ** 18) / data.vJPYreserve;
      await expect(contracts.perpetual.pushSnapshot())
        .to.emit(contracts.perpetual, "LogSnapshot")
        .withArgs(
          1625227892, // why is the block.number constant and 1625227892 ???3,
          expectedPrice,
          0
        );
      const firstSnapshot = await contracts.perpetual.getVAMMsnapshots(0);
      expect(firstSnapshot.price).to.be.equal(expectedPrice);
    });
    it("Should update the funding rate ", async function () {
      await expect(contracts.perpetual.pushSnapshot());
      await contracts.perpetual.updateFundingRate();
      await contracts.perpetual.updateFundingRate();
      await contracts.perpetual.updateFundingRate();

      const fundingRate = await contracts.perpetual.getFundingRate();
      console.log("fundingRate is", utils.formatEther(fundingRate.value));
    });
  });
});
