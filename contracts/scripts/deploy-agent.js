require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AgentNFT with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "0G");

  const AgentNFT = await hre.ethers.getContractFactory("AgentNFT");
  const contract = await AgentNFT.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("\nAgentNFT deployed to:", address);
  console.log("Explorer:", `https://chainscan-galileo.0g.ai/address/${address}`);
  console.log("\nAdd to .env:");
  console.log(`AGENT_NFT_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
