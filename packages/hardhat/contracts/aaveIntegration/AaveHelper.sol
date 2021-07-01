// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@aave/protocol-v2/contracts/interfaces/ILendingPool.sol";
import "@aave/protocol-v2/contracts/interfaces/ILendingPoolAddressesProvider.sol";
import "@aave/protocol-v2/contracts/interfaces/IAToken.sol";

import "hardhat/console.sol";

/// @dev Returns the address of the lending pool

contract AaveHelper {
    // states
    ILendingPoolAddressesProvider public provider;
    ILendingPool public lendingPool;

    // functions
    constructor(address _lendingPoolAddressProvider) public {
        ILendingPoolAddressesProvider provider = ILendingPoolAddressesProvider(
            _lendingPoolAddressProvider
        );
    }

    function getLendingPoolAddress() external returns (address) {
        return address(lendingPool);
    }

    function FindLendingPoolAdress() external returns (address) {
        lendingPool = ILendingPool(provider.getLendingPool());
    }
}
