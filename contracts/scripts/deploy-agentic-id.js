const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying AgenticID with:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", ethers.formatEther(balance), "0G");

  const AgenticID = await hre.ethers.getContractFactory("AgenticID", {
    libraries: {},
    // The contract uses ^0.8.24, our hardhat is 0.8.28 — should be compatible
  });

  const agenticID = await AgenticID.deploy("RumahPeneliti Agent", "RPAGENT", 0);
  await agenticID.waitForDeployment();
  
  const address = await agenticID.getAddress();
  console.log("AgenticID deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
