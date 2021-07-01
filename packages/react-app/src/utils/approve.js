import erc20 from "../contracts/erc20.abi";
import perpetualAddress from "../contracts/Perpetual.address";
import { Contract } from "@ethersproject/contracts";

export default function approve(provider, tokenAddress, amount, userAddress) {
  return new Promise(async (resolve, reject) => {
    const contract = new Contract(tokenAddress, erc20, provider.getSigner());
    await contract.approve(perpetualAddress, amount);
    contract.on("Approval", (address, spender, value) => {
      if (
        userAddress === address &&
        value.toNumber() === amount.toNumber() &&
        spender === perpetualAddress
      ) {
        resolve({ address, spender, value });
      }
    });
  });
}
