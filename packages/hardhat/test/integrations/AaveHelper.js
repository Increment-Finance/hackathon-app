const { expect } = require("chai");

describe("AaveHelper functions", function () {
  let owner;
  let minter;
  let addrs;
  let DaiToAveFactory;
  let daiToAave;
  let AaveExample;

  const whale = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";

  let contracts, data;
  beforeEach("Set up", async () => {
    [owner, bob, alice, ...addrs] = await ethers.getSigners();
    data = testData();
    contracts = await deployContracts(data);
  });

  beforeEach("Set up accounts", async () => {
    // get addresses to interact
    [owner, minter, redeemer, ...addrs] = await ethers.getSigners();

    DaiToAveFactory = await ethers.getContractFactory("DaiToAdai");

    daiToAave = await DaiToAveFactory.deploy();

    AaveExampleFactory = await ethers.getContractFactory("AaveExample");

    AaveExample = await AaveExampleFactory.deploy();
  });

  describe("Basics ", function () {
    it("GetLendingPoolAdress ", async function () {
      address = await daiToAave.connect(minter).GetLendingPoolAdress();

      console.log(address);
    });

    it("Transfer Dai ", async function () {
      let transferAmount = 5000;
      balance = await OccupyDAI(owner, transferAmount);
      expect(balance).to.equal(ethers.utils.parseEther("" + transferAmount));
    });
  });

  async function OccupyDAI(new_owner, transferAmount) {
    let dai = await ethers.getContractAt(
      "@openzeppelin/contracts/token/ERC20/ERC20.sol:ERC20",
      "0x6b175474e89094c44da98b954eedeac495271d0f"
    );

    const whaleSigner = await impersonateAddress(whale);

    let balance = await dai.balanceOf(new_owner.address);

    dai = dai.connect(whaleSigner);

    await dai.transfer(
      new_owner.address,
      ethers.utils.parseEther("" + transferAmount)
    );

    balance = await dai.balanceOf(new_owner.address);

    return balance;
  }
});

const impersonateAddress = async (address) => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

  const signer = await ethers.provider.getSigner(address);
  signer.address = signer._address;

  return signer;
};
