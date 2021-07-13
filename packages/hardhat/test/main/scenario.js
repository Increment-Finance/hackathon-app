const { expect } = require("chai");
const { utils } = require("ethers");
const { deployContracts, testData } = require("../helper/init.js");

describe("Increment App: Scenario", function () {
  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    contracts = await deployContracts(data);
  });

  describe("Can handle multiple trader on vAMM", function () {
    it("Bob should go long JPYUSD and Alice should go long JPYUSD", async function () {
      /********** mint assets *************/
      // Bob
      await contracts.usdc
        .connect(owner)
        .transfer(bob.address, data.depositAmount);
      await contracts.usdc
        .connect(bob)
        .approve(contracts.perpetual.address, data.depositAmount);
      await contracts.perpetual
        .connect(bob)
        .deposit(data.depositAmount, contracts.usdc.address);

      const mintAmountBob = utils.parseEther("500");
      await expect(
        contracts.perpetual.connect(bob).MintLongQuote(mintAmountBob)
      )
        .to.emit(contracts.perpetual, "buyQuoteLong")
        .withArgs(
          mintAmountBob,
          bob.address,
          utils.parseEther("55524.708495280399777902")
        );

      // Alice
      const shortCollateral = utils.parseUnits("500", 6);
      await contracts.usdc
        .connect(owner)
        .transfer(alice.address, shortCollateral);
      await contracts.usdc
        .connect(alice)
        .approve(contracts.perpetual.address, shortCollateral);
      await contracts.perpetual
        .connect(alice)
        .deposit(shortCollateral, contracts.usdc.address);

      const mintAmountAlice = utils.parseEther("1000");
      await expect(
        contracts.perpetual.connect(alice).MintLongQuote(mintAmountAlice)
      )
        .to.emit(contracts.perpetual, "buyQuoteLong")
        .withArgs(
          mintAmountAlice,
          alice.address,
          utils.parseEther("110864.642586250382252049")
        );

      const bobPnL = await contracts.perpetual.getUnrealizedPnL(bob.address);
      console.log("Bob has so much PnL", utils.formatEther(bobPnL.value));
      /********** redeem assets *************/
      // Bob
      await expect(
        contracts.perpetual.connect(bob).RedeemLongQuote(contracts.usdc.address)
      )
        .to.emit(contracts.perpetual, "sellQuoteLong")
        .withArgs(
          utils.parseEther("55524.708495280399777902"),
          bob.address,
          contracts.usdc.address
        );
      expect(
        await contracts.perpetual.getReserveBalance(
          bob.address,
          contracts.usdc.address
        )
      ).to.be.equal(utils.parseEther("101.110801784312075184"));

      // Alice
      await expect(
        contracts.perpetual
          .connect(alice)
          .RedeemLongQuote(contracts.usdc.address)
      )
        .to.emit(contracts.perpetual, "sellQuoteLong")
        .withArgs(
          utils.parseEther("110864.642586250382252049"),
          alice.address,
          contracts.usdc.address
        );
      expect(
        await contracts.perpetual.getReserveBalance(
          alice.address,
          contracts.usdc.address
        )
      ).to.be.equal(utils.parseEther("498.889198215687924816"));
    });
  });
});
