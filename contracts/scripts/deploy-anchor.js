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
  const network = hre.network.name;
  const explorerUrl = network === "zeroMainnet"
    ? `https://chainscan.0g.ai/address/${address}`
    : `https://chainscan-galileo.0g.ai/address/${address}`;
  console.log("Explorer:", explorerUrl);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
