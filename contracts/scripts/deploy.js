const hre = require("hardhat");

async function main() {
  const JournalPayment = await hre.ethers.getContractFactory("JournalPayment");
  const contract = await JournalPayment.deploy();
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  console.log("JournalPayment deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
