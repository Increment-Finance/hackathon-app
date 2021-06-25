const { expect } = require("chai");
const { waffle } = require("hardhat");
const { utils } = require("ethers");



describe("Mock Chainlink Oracles", function () {
    let chainlinkOracle;
    const decimals = 8;
    const initialValue = 1;

    beforeEach('Set up', async () => {
        [owner, user1, user2, ...addrs] = await ethers.getSigners();
        const ChainlinkOracle = await ethers.getContractFactory("MockV3Aggregator");
        chainlinkOracle = await ChainlinkOracle.connect(owner).deploy(decimals, initialValue);
    });
    describe("Deployment", function () {
        it("Should set some initial values with deployment ", async function () {
            expect(await chainlinkOracle.decimals()).to.be.equal(decimals);

            expect(await chainlinkOracle.latestAnswer()).to.be.equal(initialValue);
        });
    });
    describe("Manipulation", function () {
        it("Should be able to manipulate prices ", async function () {
            const newValue = 2;
            await chainlinkOracle.updateAnswer(newValue);
            
            expect(await chainlinkOracle.latestAnswer()).to.be.equal(newValue);         
        });
    });
});