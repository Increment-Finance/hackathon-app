const { utils } = require("ethers");

// source
function getAaveContracts(network) {
  const aaveProtocol = {};

  if (network == "mainnet") {
    aaveProtocol.LendingPoolAddressesProvider = utils.getAddress(
      "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5"
    );
    aaveProtocol.LendingPool = utils.getAddress(
      "0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9"
    );
  } else if (network == "kovan") {
    aaveProtocol.LendingPoolAddressesProvider = utils.getAddress(
      "0x88757f2f99175387aB4C6a4b3067c77A695b0349"
    );
  } else if (network == "polygon") {
    aaveProtocol.LendingPoolAddressesProvider = utils.getAddress(
      "0xd05e3E715d945B59290df0ae8eF85c1BdB684744"
    );
  } else if (network == "mumbai") {
    aaveProtocol.LendingPoolAddressesProvider = utils.getAddress(
      "0x178113104fEcbcD7fF8669a0150721e231F0FD4B"
    );
  } else {
    throw `Network ${network} is not supported `;
  }
  return aaveProtocol;
}

module.exports = { getAaveContracts };
