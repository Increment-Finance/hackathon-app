const { expect } = require("chai");
const { utils } = require("ethers");
const {
  deployContracts,
  forkContracts,
  testData,
} = require("../helper/init.js");

describe("Increment App: Deployment", function () {
  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    //contracts = await deployContracts(data);
    contracts = await forkContracts(data);
  });

  describe("Deployment", function () {
    it("Should correctly deploy usdc ", async function () {
      expect(await contracts.usdc.balanceOf(owner.address)).to.be.equal(
        data.supply
      );
      expect(await contracts.usdc.decimals()).to.be.equal(6);
    });

    it("Should initialize vAMM pool", async function () {
      const pool = await contracts.perpetual.connect(owner).getPoolInfo();

      // correct reserve tokens
      expect(pool.vQuote).to.be.equal(data.vJPYreserve);
      expect(pool.vBase).to.be.equal(data.vUSDreserve);

      // check pool price
      const expectPrice = utils.parseEther(
        (data.vUSDreserve / data.vJPYreserve).toString()
      ); // adjust for normalization by 10**18 in contract code
      expect(pool.price).to.be.equal(expectPrice);

      // check pool constant
      const normalizationConstant = 10 ** 38; /// adjust by big number to avoid overflow error from chai library
      const expectTotalAssetReserve =
        (data.vJPYreserve * data.vUSDreserve) / normalizationConstant;
      const realizedTotalAssetReserve =
        pool.totalAssetReserve / normalizationConstant;
      expect(expectTotalAssetReserve).to.be.equal(realizedTotalAssetReserve);
    });
    it("Should initialize oracles", async function () {
      expect(
        await contracts.perpetual.connect(owner).getQuoteAssetOracle()
      ).to.be.equal(contracts.jpy_oracle.address);
      expect(
        await contracts.perpetual
          .connect(owner)
          .getAssetOracle(contracts.usdc.address)
      ).to.be.equal(contracts.usdc_oracle.address);
    });
    it("Should set reserve asset", async function () {
      const tokens = await contracts.perpetual.getReserveAssets();
      expect(tokens[0]).to.be.equal(contracts.usdc.address);
    });
    it("Should give owner role to deployer address", async function () {
      expect(await contracts.perpetual.owner()).to.be.equal(owner.address);
    });
  });
});
