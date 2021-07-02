const { utils } = require("ethers");

const convertUSDCtoEther = (number) => {
  const numString = utils.formatUnits(number, 6);
  return utils.parseEther(numString);
};

module.exports = { convertUSDCtoEther };
