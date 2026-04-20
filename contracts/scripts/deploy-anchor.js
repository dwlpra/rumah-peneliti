const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying PaperAnchor with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "0G");

  const PaperAnchor = await hre.ethers.getContractFactory("PaperAnchor");
  const contract = await PaperAnchor.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PaperAnchor deployed to:", address);

  // Verify on explorer
  console.log("Explorer:", `https://chainscan-galileo.0g.ai/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
