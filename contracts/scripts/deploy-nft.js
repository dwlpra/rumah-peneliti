const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying ResearchNFT with account:", deployer.address);

  const ResearchNFT = await hre.ethers.getContractFactory("ResearchNFT");
  const contract = await ResearchNFT.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("ResearchNFT deployed to:", address);
  console.log("Explorer:", `https://chainscan-galileo.0g.ai/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
