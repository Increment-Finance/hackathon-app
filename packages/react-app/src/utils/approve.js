import erc20 from "../contracts/erc20.abi";
import perpetualAddress from "../contracts/Perpetual.address";
import { Contract } from "@ethersproject/contracts";

export default async function approve(provider, tokenAddress, amount) {
  await new Contract(tokenAddress, erc20, provider.getSigner()).approve(
    perpetualAddress,
    amount
  );
}
