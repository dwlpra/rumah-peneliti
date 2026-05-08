require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const hre = require("hardhat");

async function main() {
  const AGENT_NFT_ADDRESS = process.env.AGENT_NFT_ADDRESS;
  if (!AGENT_NFT_ADDRESS) {
    console.error("Set AGENT_NFT_ADDRESS in .env");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting agent with account:", deployer.address);
  console.log("AgentNFT contract:", AGENT_NFT_ADDRESS);

  const AgentNFT = await hre.ethers.getContractFactory("AgentNFT");
  const contract = AgentNFT.attach(AGENT_NFT_ADDRESS);

  // Mint the "AI Kurator" agent (AgentType.Kurator = 0)
  console.log("\nMinting AI Kurator agent...");
  const tx = await contract.mintAgent(
    deployer.address,
    "AI Kurator",
    "Multi-agent research curation pipeline powered by GLM-5 via 0G Compute Network. Runs Summarizer, Scorer, and Tagger agents in parallel.",
    0,  // AgentType.Kurator
    "GLM-5-FP8 via 0G Compute / Z.AI GLM-5.1 API",
    '["summarize","score","tag","classify","review"]'
  );
  const receipt = await tx.wait();
  console.log("Minted! Tx:", receipt.hash);

  // Read back the agent data
  const count = await contract.agentCount();
  const agent = await contract.getAgent(count);
  console.log("\nAgent data:");
  console.log("  Token ID:", agent.tokenId.toString());
  console.log("  Name:", agent.name);
  console.log("  Type:", agent.agentType);
  console.log("  Model:", agent.model);
  console.log("  Active:", agent.active);

  console.log("\nAdd to .env:");
  console.log(`KURATOR_AGENT_TOKEN_ID=${agent.tokenId.toString()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
