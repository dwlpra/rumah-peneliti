require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const hre = require("hardhat");

async function main() {
  const AGENT_NFT_ADDRESS = process.env.AGENT_NFT_ADDRESS;
  if (!AGENT_NFT_ADDRESS) {
    console.error("Set AGENT_NFT_ADDRESS in .env");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AgentTipJar with account:", deployer.address);
  console.log("AgentNFT address:", AGENT_NFT_ADDRESS);

  const AgentTipJar = await hre.ethers.getContractFactory("AgentTipJar");
  const tipJar = await AgentTipJar.deploy(AGENT_NFT_ADDRESS);
  await tipJar.waitForDeployment();

  const address = await tipJar.getAddress();
  console.log("AgentTipJar deployed to:", address);
  console.log("\nAdd to .env:");
  console.log(`AGENT_TIP_JAR_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
