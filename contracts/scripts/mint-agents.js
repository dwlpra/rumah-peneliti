require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });
const hre = require("hardhat");

async function main() {
  const AGENT_NFT_ADDRESS = process.env.AGENT_NFT_ADDRESS;
  if (!AGENT_NFT_ADDRESS) {
    console.error("Set AGENT_NFT_ADDRESS in .env");
    process.exit(1);
  }

  const [deployer] = await hre.ethers.getSigners();
  console.log("Minting agents with account:", deployer.address);
  console.log("AgentNFT contract:", AGENT_NFT_ADDRESS);

  const AgentNFT = await hre.ethers.getContractFactory("AgentNFT");
  const contract = AgentNFT.attach(AGENT_NFT_ADDRESS);

  const agents = [
    {
      name: "Summarizer",
      description: "Generates concise summaries and key takeaways from research papers. Extracts the core contribution, methodology, and findings into accessible language.",
      agentType: 2, // AgentType.Summarizer
      model: "GLM-5-FP8 via 0G Compute / Z.AI GLM-5.1 API",
      capabilities: '["summarize","generate_article","key_takeaways","extract_findings"]',
    },
    {
      name: "Scorer",
      description: "Evaluates research papers across multiple dimensions: novelty, clarity, methodology, and impact. Produces quantitative AI Research Scores.",
      agentType: 1, // AgentType.Scorer
      model: "GLM-5-FP8 via 0G Compute / Z.AI GLM-5.1 API",
      capabilities: '["score","evaluate","assess_quality","reason"]',
    },
    {
      name: "Tagger",
      description: "Classifies research papers by domain, field, and topic. Generates relevant tags and categorizations for discovery and organization.",
      agentType: 3, // AgentType.Tagger
      model: "GLM-5-FP8 via 0G Compute / Z.AI GLM-5.1 API",
      capabilities: '["tag","classify","categorize","domain_detect"]',
    },
  ];

  for (const agent of agents) {
    console.log(`\nMinting ${agent.name} agent...`);
    const tx = await contract.mintAgent(
      deployer.address,
      agent.name,
      agent.description,
      agent.agentType,
      agent.model,
      agent.capabilities
    );
    const receipt = await tx.wait();
    console.log(`  Minted! Tx: ${receipt.hash}`);

    // Read back
    const count = await contract.agentCount();
    const data = await contract.getAgent(count);
    console.log(`  Token ID: ${data.tokenId.toString()}`);
    console.log(`  Name: ${data.name}`);
    console.log(`  Type: ${data.agentType} (active: ${data.active})`);
  }

  const totalAgents = await contract.agentCount();
  console.log(`\nTotal agents minted: ${totalAgents}`);
  console.log("\nAdd to .env:");
  console.log("SUMMARIZER_AGENT_TOKEN_ID=2");
  console.log("SCORER_AGENT_TOKEN_ID=3");
  console.log("TAGGER_AGENT_TOKEN_ID=4");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
