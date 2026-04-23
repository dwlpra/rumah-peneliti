require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying to 0G MAINNET...");
  console.log("Deployer:", deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "0G");
  console.log("Chain ID:", (await hre.ethers.provider.getNetwork()).chainId.toString());
  
  if (balance === 0n) {
    console.error("❌ No balance! Send 0G to deployer wallet first.");
    process.exit(1);
  }

  // 1. JournalPayment
  console.log("\n--- Deploying JournalPayment ---");
  const JournalPayment = await hre.ethers.getContractFactory("JournalPayment");
  const journalPayment = await JournalPayment.deploy();
  await journalPayment.waitForDeployment();
  const jpAddr = await journalPayment.getAddress();
  console.log("✅ JournalPayment:", jpAddr);

  // 2. PaperAnchor
  console.log("\n--- Deploying PaperAnchor ---");
  const PaperAnchor = await hre.ethers.getContractFactory("PaperAnchor");
  const paperAnchor = await PaperAnchor.deploy();
  await paperAnchor.waitForDeployment();
  const paAddr = await paperAnchor.getAddress();
  console.log("✅ PaperAnchor:", paAddr);

  // 3. ResearchNFT
  console.log("\n--- Deploying ResearchNFT ---");
  const ResearchNFT = await hre.ethers.getContractFactory("ResearchNFT");
  const researchNFT = await ResearchNFT.deploy();
  await researchNFT.waitForDeployment();
  const nftAddr = await researchNFT.getAddress();
  console.log("✅ ResearchNFT:", nftAddr);

  console.log("\n========================================");
  console.log("   MAINNET DEPLOYMENT COMPLETE!");
  console.log("========================================");
  console.log(`JournalPayment: ${jpAddr}`);
  console.log(`PaperAnchor:    ${paAddr}`);
  console.log(`ResearchNFT:    ${nftAddr}`);
  console.log(`Explorer: https://chainscan.0g.ai/address/${paAddr}`);
  console.log("========================================");
  console.log("\nUpdate your .env with these addresses!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
