import puppeteer from "puppeteer";
import dappeteer from "dappeteer";

async function main() {
  const browser = await dappeteer.launch(puppeteer);
  const metamask = await dappeteer.getMetamask(browser);

  // create or import an account
  // await metamask.createAccount()
  await metamask.importAccount("already turtle birth enroll since...");

  // you can change the network if you want
  await metamask.switchNetwork("kovan");

  // go to a dapp and do something that prompts MetaMask to confirm a transaction
  const page = await browser.newPage();
  await page.goto("https://increment.finance/dashboard");
  const payButton = await page.$("#pay-with-eth");
  await payButton.click();

  //*[@id="root"]/div/div[2]/div/div[1]/div[2]/div[1]/button// 🏌
  await metamask.confirmTransaction();
}

main();
