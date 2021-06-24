// SPDX-License-Identifier: MIT
pragma solidity 0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract mockERC20 is ERC20 {
    constructor(
        uint256 initialSupply,
        string memory shortName,
        string memory longName
    ) ERC20(shortName, longName) {
        _mint(msg.sender, initialSupply);
    }
}
