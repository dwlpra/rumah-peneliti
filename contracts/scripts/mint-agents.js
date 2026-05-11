const hre = require("hardhat");

async function main() {
  const AGENTIC_ID = "0x82c5e31880929de181E5DF78D60f342168d18115";
  const [deployer] = await hre.ethers.getSigners();
  
  const AgenticID = await hre.ethers.getContractFactory("AgenticID");
  const contract = AgenticID.attach(AGENTIC_ID);

  const MINTER_ROLE = await contract.MINTER_ROLE();
  console.log("Has minter role:", await contract.hasRole(MINTER_ROLE, deployer.address));

  const agents = [
    {
      name: "AI Kurator",
      datas: [
        { dataDescription: "model:0g-compute-decentralized-inference", dataHash: hre.ethers.id("model:0g-compute") },
        { dataDescription: "capability:multi-agent-curation", dataHash: hre.ethers.id("capability:curation") },
        { dataDescription: "capability:scoring-evaluation", dataHash: hre.ethers.id("capability:scoring") },
        { dataDescription: "capability:summarization", dataHash: hre.ethers.id("capability:summarization") },
        { dataDescription: "capability:tagging-classification", dataHash: hre.ethers.id("capability:tagging") },
        { dataDescription: "prompt:research-paper-curation-pipeline", dataHash: hre.ethers.id("prompt:research-curation") },
      ]
    },
    {
      name: "AI Scorer",
      datas: [
        { dataDescription: "model:0g-compute-decentralized-inference", dataHash: hre.ethers.id("model:0g-compute") },
        { dataDescription: "capability:scoring-evaluation", dataHash: hre.ethers.id("capability:scoring") },
        { dataDescription: "prompt:paper-quality-scoring-rubric", dataHash: hre.ethers.id("prompt:paper-scoring") },
      ]
    },
    {
      name: "AI Summarizer",
      datas: [
        { dataDescription: "model:0g-compute-decentralized-inference", dataHash: hre.ethers.id("model:0g-compute") },
        { dataDescription: "capability:summarization", dataHash: hre.ethers.id("capability:summarization") },
        { dataDescription: "prompt:paper-summarization-key-findings", dataHash: hre.ethers.id("prompt:paper-summarization") },
      ]
    },
    {
      name: "AI Tagger",
      datas: [
        { dataDescription: "model:0g-compute-decentralized-inference", dataHash: hre.ethers.id("model:0g-compute") },
        { dataDescription: "capability:tagging-classification", dataHash: hre.ethers.id("capability:tagging") },
        { dataDescription: "prompt:paper-domain-classification", dataHash: hre.ethers.id("prompt:paper-tagging") },
      ]
    }
  ];

  const metadata = [
    JSON.stringify({ name: "AI Kurator", description: "Multi-agent research curation orchestrator", model: "0G Compute", agentType: "Orchestrator", version: "1.0.0" }),
    JSON.stringify({ name: "AI Scorer", description: "Evaluates papers across novelty, methodology, clarity, impact", model: "0G Compute", agentType: "Scorer", version: "1.0.0" }),
    JSON.stringify({ name: "AI Summarizer", description: "Generates concise summaries and key findings", model: "0G Compute", agentType: "Summarizer", version: "1.0.0" }),
    JSON.stringify({ name: "AI Tagger", description: "Classifies papers by domain, methodology, topics", model: "0G Compute", agentType: "Tagger", version: "1.0.0" }),
  ];

  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    console.log(`\nMinting agent ${i+1}: ${agent.name}...`);
    
    // iMintWithRole — mint + set intelligent data in one tx
    const tx = await contract.iMintWithRole(deployer.address, agent.datas, deployer.address);
    const receipt = await tx.wait();
    console.log(`  Minted! tx: ${receipt.hash}`);
    
    const totalSupply = await contract.totalSupply();
    const tokenId = totalSupply - 1n;
    console.log(`  Token ID: ${tokenId}`);
    
    // Set token URI (metadata)
    const uriTx = await contract.setTokenURI(tokenId, metadata[i]);
    await uriTx.wait();
    console.log(`  Metadata set`);
    
    // Verify
    const idata = await contract.getIntelligentDatas(tokenId);
    console.log(`  Intelligent data entries: ${idata.length}`);
  }
  
  console.log("\n✅ All 4 agents minted on 0G Mainnet!");
  console.log("Contract:", AGENTIC_ID);
  console.log("Total supply:", (await contract.totalSupply()).toString());
}

main().catch(console.error);
