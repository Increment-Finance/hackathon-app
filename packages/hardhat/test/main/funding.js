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
      await contracts.perpetual.pushSnapshot().to.emit(contracts.perpetual, "LogSnapshot")
      .withArgs(
        block.timestamp,
        data.

    });
  });
});
