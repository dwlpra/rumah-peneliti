require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const hre = require("hardhat");

async function main() {
  const AGENT_NFT_ADDRESS = process.env.AGENT_NFT_ADDRESS;
  if (!AGENT_NFT_ADDRESS) {
    console.error("Set AGENT_NFT_ADDRESS in .env");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Updating agents with account:", deployer.address);

  const AgentNFT = await hre.ethers.getContractFactory("AgentNFT");
  const contract = AgentNFT.attach(AGENT_NFT_ADDRESS);

  const updates = [
    {
      tokenId: 1,
      description: "Multi-agent research curation pipeline powered by GLM-5 via 0G Compute Network. Runs Summarizer, Scorer, and Tagger agents in parallel.",
      agentType: 0,
      model: "GLM-5 via 0G Compute Network",
      capabilities: '["summarize","score","tag","classify","review"]',
    },
    {
      tokenId: 2,
      description: "Generates concise summaries and key takeaways from research papers. Extracts the core contribution, methodology, and findings into accessible language.",
      agentType: 2,
      model: "GLM-5 via 0G Compute Network",
      capabilities: '["summarize","generate_article","key_takeaways","extract_findings"]',
    },
    {
      tokenId: 3,
      description: "Evaluates research papers across multiple dimensions: novelty, clarity, methodology, and impact. Produces quantitative AI Research Scores.",
      agentType: 1,
      model: "GLM-5 via 0G Compute Network",
      capabilities: '["score","evaluate","assess_quality","reason"]',
    },
    {
      tokenId: 4,
      description: "Classifies research papers by domain, field, and topic. Generates relevant tags and categorizations for discovery and organization.",
      agentType: 3,
      model: "GLM-5 via 0G Compute Network",
      capabilities: '["tag","classify","categorize","domain_detect"]',
    },
  ];

  for (const u of updates) {
    console.log(`\nUpdating Agent #${u.tokenId}...`);
    const tx = await contract.updateAgent(
      u.tokenId,
      u.description,
      u.agentType,
      u.model,
      u.capabilities
    );
    const receipt = await tx.wait();
    console.log(`  Updated! Tx: ${receipt.hash}`);

    // Verify
    const agent = await contract.getAgent(u.tokenId);
    console.log(`  Model: ${agent.model}`);
  }

  console.log("\nAll agents updated successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
