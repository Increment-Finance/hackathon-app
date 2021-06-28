const { expect } = require("chai");
const { utils } = require("ethers");

describe("Increment App", function () {
  // test data. Use BigNumber to avoid overflow
  const supply = utils.parseEther("100000000000000000000");
  const vUSDreserve = utils.parseEther("900000"); // 900 000
  const vEURreserve = utils.parseEther("100000000"); // 100 000 0000
  const depositAmount = utils.parseEther("100");

  // initialize contracts
  let usdc, perpetual, euro_oracle, usdc_oracle;

  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();

    // Mock Chainlink Oracles
    const ChainlinkOracle = await ethers.getContractFactory("MockV3Aggregator");
    euro_oracle = await ChainlinkOracle.connect(owner).deploy(8, 1);
    usdc_oracle = await ChainlinkOracle.connect(owner).deploy(8, 1);

    // USDC reserve
    const USDC = await ethers.getContractFactory("mockERC20");
    usdc = await USDC.connect(owner).deploy(supply, "USDC", "mockUSDC");

    // Perpetual
    const Perpetual = await ethers.getContractFactory("Perpetual");
    perpetual = await Perpetual.connect(owner).deploy(
      vEURreserve,
      vUSDreserve,
      euro_oracle.address,
      [usdc.address],
      [usdc_oracle.address]
    );
  });

  /*afterEach("Check vAMM", async () => {
    // check vAMM parameters after trade
    vamm_state = await perpetual.getPoolInfo();
    console.log("vamm has the following state", vamm_state.toString());


  })*/
  describe("Deployment", function () {
    it("Should given tokens with deployment ", async function () {
      expect(await usdc.balanceOf(owner.address)).to.be.equal(supply);
    });
    it("Should initialize vAMM pool", async function () {
      const pool = await perpetual.connect(owner).getPoolInfo();

      // correct reserve tokens
      expect(pool.vEUR).to.be.equal(vEURreserve);
      expect(pool.vUSD).to.be.equal(vUSDreserve);

      // check pool price
      const expectPrice = utils.parseEther(
        (vUSDreserve / vEURreserve).toString()
      ); // adjust for normalization by 10**18 in contract code
      expect(pool.price).to.be.equal(expectPrice);

      // check pool constant
      const normalizationConstant = 10 ** 38; /// adjust by big number to avoid overflow error from chai library
      const expectTotalAssetReserve =
        (vEURreserve * vUSDreserve) / normalizationConstant;
      const realizedTotalAssetReserve =
        pool.totalAssetReserve / normalizationConstant;
      expect(expectTotalAssetReserve).to.be.equal(realizedTotalAssetReserve);
    });
    it("Should initialize oracles", async function () {
      expect(await perpetual.connect(owner).getEUROracle()).to.be.equal(
        euro_oracle.address
      );
      expect(
        await perpetual.connect(owner).getAssetOracle(usdc.address)
      ).to.be.equal(usdc_oracle.address);
    });
    it("Should set reserve asset", async function () {
      const tokens = await perpetual.getReserveAssets();
      expect(tokens[0]).to.be.equal(usdc.address);
    });
    it("Should give owner role to deployer address", async function () {
      expect(await perpetual.owner()).to.be.equal(owner.address);
    });
  });
  describe("Can deposit and withdraw USDC", function () {
    it("Should give allowance to perpetual contract", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      const allowance = await usdc.allowance(owner.address, perpetual.address);
      expect(allowance).to.be.equal(depositAmount);
    });
    it("Should deposit USDC", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      const allowance = await usdc.allowance(owner.address, perpetual.address);
      expect(allowance).to.be.equal(depositAmount);
      await expect(perpetual.deposit(depositAmount, usdc.address))
        .to.emit(perpetual, "Deposit")
        .withArgs(depositAmount, owner.address, usdc.address);
    });
    it("Should withdraw USDC", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.deposit(depositAmount, usdc.address);

      await expect(perpetual.withdraw(depositAmount, usdc.address))
        .to.emit(perpetual, "Withdraw")
        .withArgs(depositAmount, owner.address, usdc.address);

      expect(await usdc.balanceOf(owner.address)).to.be.equal(supply);
    });
  });

  describe("Can buy assets on vAMM", function () {
    it("Can go long EURUSD ", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.connect(owner).deposit(depositAmount, usdc.address);

      const mintAmount = utils.parseEther("500");
      await expect(perpetual.connect(owner).MintLongEUR(mintAmount))
        .to.emit(perpetual, "buyEURUSDlong")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55524.708495280399777902")
        );
    });
    it("Can go short EURUSD ", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.connect(owner).deposit(depositAmount, usdc.address);

      const mintAmount = utils.parseEther("500");

      await expect(perpetual.connect(owner).MintShortEUR(mintAmount))
        .to.emit(perpetual, "buyEURUSDshort")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55586.436909394107837687")
        );
    });
  });

  describe("Can redeem assets from vAMM", function () {
    it("Should sell long EURUSD", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.connect(owner).deposit(depositAmount, usdc.address);
      const mintAmount = utils.parseEther("500");
      await perpetual.connect(owner).MintLongEUR(mintAmount);
      expect(await perpetual.getUserMarginRatio(owner.address)).to.be.equal(
        utils.parseEther("0.2")
      ); // 100/500

      const longBalance = await perpetual.getLongBalance(owner.address);
      await perpetual.RedeemLongEUR(longBalance, usdc.address);
    });
    it("Should sell short EURUSD", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.connect(owner).deposit(depositAmount, usdc.address);
      const mintAmount = utils.parseEther("500");
      await perpetual.connect(owner).MintShortEUR(mintAmount);
      expect(await perpetual.getUserMarginRatio(owner.address)).to.be.equal(
        utils.parseEther("0.2")
      ); // 100/500

      const shortBalance = await perpetual.getShortBalance(owner.address);
      await perpetual.connect(owner).RedeemShortEUR(shortBalance, usdc.address);
    });
  });

  describe("Can handle multiple trader on vAMM", function () {
    it("Bob should go long EURUSD and Alice should go long EURUSD", async function () {
      /********** mint assets *************/
      // Bob
      await usdc.connect(owner).transfer(bob.address, depositAmount);
      await usdc.connect(bob).approve(perpetual.address, depositAmount);
      await perpetual.connect(bob).deposit(depositAmount, usdc.address);

      const mintAmountBob = utils.parseEther("500");
      await expect(perpetual.connect(bob).MintLongEUR(mintAmountBob))
        .to.emit(perpetual, "buyEURUSDlong")
        .withArgs(
          mintAmountBob,
          bob.address,
          utils.parseEther("55524.708495280399777902")
        );

      // Alice
      const shortCollateral = utils.parseEther("500");
      await usdc.connect(owner).transfer(alice.address, shortCollateral);
      await usdc.connect(alice).approve(perpetual.address, shortCollateral);
      await perpetual.connect(alice).deposit(shortCollateral, usdc.address);

      const mintAmountAlice = utils.parseEther("1000");
      await expect(perpetual.connect(alice).MintLongEUR(mintAmountAlice))
        .to.emit(perpetual, "buyEURUSDlong")
        .withArgs(
          mintAmountAlice,
          alice.address,
          utils.parseEther("110864.642586250382252049")
        );

      /********** redeem assets *************/
      // Bob
      await expect(
        perpetual
          .connect(bob)
          .RedeemLongEUR(
            utils.parseEther("55524.708495280399777902"),
            usdc.address
          )
      )
        .to.emit(perpetual, "sellEURUSDlong")
        .withArgs(
          utils.parseEther("55524.708495280399777902"),
          bob.address,
          usdc.address
        );
      expect(
        await perpetual.getReserveBalance(bob.address, usdc.address)
      ).to.be.equal(utils.parseEther("101.110801784312075184"));

      // Alice
      await expect(
        perpetual
          .connect(alice)
          .RedeemLongEUR(
            utils.parseEther("110864.642586250382252049"),
            usdc.address
          )
      )
        .to.emit(perpetual, "sellEURUSDlong")
        .withArgs(
          utils.parseEther("110864.642586250382252049"),
          alice.address,
          usdc.address
        );
      expect(
        await perpetual.getReserveBalance(alice.address, usdc.address)
      ).to.be.equal(utils.parseEther("498.889198215687924816"));
    });
  });
  describe("Can buy assets on vAMM with leverage factor", function () {
    it("Can go long EURUSD with 5 times leverage ", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.connect(owner).deposit(depositAmount, usdc.address);

      const mintAmount = utils.parseEther("500"); // 100 deposit & 5 leverage === 500 shares minted
      await expect(perpetual.connect(owner).MintLongWithLeverage(5))
        .to.emit(perpetual, "buyEURUSDlong")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55524.708495280399777902")
        );
    });
    it("Can go short EURUSD with 5 times leverage ", async function () {
      await usdc.connect(owner).approve(perpetual.address, depositAmount);
      await perpetual.connect(owner).deposit(depositAmount, usdc.address);

      const mintAmount = utils.parseEther("500");
      await expect(perpetual.connect(owner).MintShortWithLeverage(5))
        .to.emit(perpetual, "buyEURUSDshort")
        .withArgs(
          mintAmount,
          owner.address,
          utils.parseEther("55586.436909394107837687")
        );
    });
  });
});
