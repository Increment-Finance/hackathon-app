const { expect } = require("chai");
const { utils } = require("ethers");

const { getTokenAddresses } = require("../../integrationAddresses/assets.js");

async function occupyAUSDC(new_owner, transferAmount) {
  // load contract from address (aToken v2 !)
  let aUSDC = await ethers.getContractAt(
    "@aave/protocol-v2/contracts/protocol/tokenization/AToken.sol:AToken",
    getTokenAddresses("mainnet").aUSDC
  );
  const whale = "0x1D2c4Cd9beE9DFe088430b95d274e765151C32db";
  return _stealTokens(new_owner, transferAmount, aUSDC, whale);
}

async function occupyUSDC(new_owner, transferAmount) {
  // load contract from address (aToken v2 !)
  let USDC = await ethers.getContractAt(
    "@aave/protocol-v2/contracts/protocol/tokenization/AToken.sol:AToken",
    getTokenAddresses("mainnet").USDC
  );
  const whale = "0x47ac0Fb4F2D84898e4D9E7b4DaB3C24507a6D503";
  return _stealTokens(new_owner, transferAmount, USDC, whale);
}

/// @dev Steal ERC20 tokens from address
const _stealTokens = async (new_owner, transferAmount, token, whale) => {
  // take over whale account
  const whaleSigner = await _impersonateAddress(whale);
  expect(await token.balanceOf(whaleSigner.address)).to.be.above(
    transferAmount
  );

  // send token to owner address
  let oldBalance = await token.balanceOf(new_owner.address);
  await token.connect(whaleSigner).transfer(new_owner.address, transferAmount);
  let newBalance = oldBalance + transferAmount;
  //expect(await token.balanceOf(new_owner.address)).to.be.equal(newBalance); Check fails if tokens are stolen multiple times

  return newBalance;
};

/// @dev Take over another address (see: https://hardhat.org/guides/mainnet-forking.html for reference)
const _impersonateAddress = async (address) => {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [address],
  });

  const signer = await ethers.provider.getSigner(address);
  signer.address = signer._address;

  return signer;
};
module.exports = { occupyAUSDC, occupyUSDC };
