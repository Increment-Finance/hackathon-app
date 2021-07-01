const { expect } = require("chai");
const { utils } = require("ethers");
const { deployContracts, testData } = require("./helper/init.js");

describe("Increment App: Scenario", function () {
  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    contracts = await deployContracts(data);
  });

  describe("Can handle multiple trader on vAMM", function () {
    it("Bob should go long EURUSD and Alice should go long EURUSD", async function () {
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
      await expect(contracts.perpetual.connect(bob).MintLongEUR(mintAmountBob))
        .to.emit(contracts.perpetual, "buyEURUSDlong")
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
        contracts.perpetual.connect(alice).MintLongEUR(mintAmountAlice)
      )
        .to.emit(contracts.perpetual, "buyEURUSDlong")
        .withArgs(
          mintAmountAlice,
          alice.address,
          utils.parseEther("110864.642586250382252049")
        );

      /********** redeem assets *************/
      // Bob
      await expect(
        contracts.perpetual
          .connect(bob)
          .RedeemLongEUR(
            contracts.usdc.address
          )
      )
        .to.emit(contracts.perpetual, "sellEURUSDlong")
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
          .RedeemLongEUR(
            contracts.usdc.address
          )
      )
        .to.emit(contracts.perpetual, "sellEURUSDlong")
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
