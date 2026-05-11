require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const hre = require("hardhat");

async function main() {
  const AGENTIC_ID_ADDRESS = "0x82c5e31880929de181E5DF78D60f342168d18115";
  
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying new AgentTipJar with account:", deployer.address);
  console.log("Pointing to AgenticID:", AGENTIC_ID_ADDRESS);

  const AgentTipJar = await hre.ethers.getContractFactory("AgentTipJar");
  const tipJar = await AgentTipJar.deploy(AGENTIC_ID_ADDRESS);
  await tipJar.waitForDeployment();

  const address = await tipJar.getAddress();
  console.log("New AgentTipJar deployed to:", address);
  
  // Verify it references the right contract
  const code = await hre.ethers.provider.getCode(AGENTIC_ID_ADDRESS);
  console.log("AgenticID code length:", code.length);
  console.log("\nUpdate .env and constants:");
  console.log(`AGENT_TIP_JAR_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
