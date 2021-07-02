const { utils } = require("ethers");

function getTokenAddresses(network) {
  const tokenAddresses = {};

  if (network == "mainnet") {
    tokenAddresses.aUSDC = utils.getAddress(
      "0xbcca60bb61934080951369a648fb03df4f96263c"
    );
    tokenAddresses.USDC = utils.getAddress(
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
    );
  } else if (network == "kovan") {
    tokenAddresses.USDC = utils.getAddress(
      "0xe22da380ee6b445bb8273c81944adeb6e8450422"
    );
    tokenAddresses.aUSDC = utils.getAddress(
      "0xe12afec5aa12cf614678f9bfeeb98ca9bb95b5b0"
    );
    tokenAddresses.aETH = utils.getAddress(
      "0x87b1f4cf9bd63f7bbd3ee1ad04e8f52540349347"
    );
  } else if (network == "polygon") {
  } else if (network == "mumbai") {
  } else {
    throw `Network ${network} is not supported `;
  }
  return tokenAddresses;
}

module.exports = { getTokenAddresses };
