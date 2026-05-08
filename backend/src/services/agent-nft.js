/**
 * AgentNFT Service
 *
 * Reads on-chain AI Agent identity from the AgentNFT smart contract.
 * Used to display agent provenance on curated articles.
 */

const { ethers } = require("ethers");

const RPC_URL = process.env.RPC_URL || process.env.ZERO_MAINNET_RPC || "https://evmrpc.0g.ai";
const AGENT_NFT_ADDRESS = process.env.AGENT_NFT_ADDRESS || "";

const ABI = [
  "function getAgent(uint256 tokenId) external view returns (tuple(uint256 tokenId, string name, string description, uint8 agentType, string model, string capabilities, address creator, uint256 createdAt, uint256 updatedAt, bool active))",
  "function getAgentByName(string name) external view returns (tuple(uint256 tokenId, string name, string description, uint8 agentType, string model, string capabilities, address creator, uint256 createdAt, uint256 updatedAt, bool active))",
  "function agentCount() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
];

const AGENT_TYPE_NAMES = ["Kurator", "Scorer", "Summarizer", "Tagger", "Reviewer", "Custom"];

let _contract = null;
function getContract() {
  if (!AGENT_NFT_ADDRESS) return null;
  if (!_contract) {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    _contract = new ethers.Contract(AGENT_NFT_ADDRESS, ABI, provider);
  }
  return _contract;
}

function formatAgent(agent) {
  return {
    tokenId: agent.tokenId.toString(),
    name: agent.name,
    description: agent.description,
    agentType: Number(agent.agentType),
    agentTypeName: AGENT_TYPE_NAMES[Number(agent.agentType)] || "Unknown",
    model: agent.model,
    capabilities: JSON.parse(agent.capabilities || "[]"),
    creator: agent.creator,
    createdAt: Number(agent.createdAt),
    updatedAt: Number(agent.updatedAt),
    active: agent.active,
    contractAddress: AGENT_NFT_ADDRESS,
  };
}

async function getAgentById(tokenId) {
  const contract = getContract();
  if (!contract || !tokenId) return null;
  try {
    const agent = await contract.getAgent(tokenId);
    return formatAgent(agent);
  } catch (e) {
    console.warn("[AgentNFT] Failed to get agent:", e.message);
    return null;
  }
}

async function getAgentByName(name) {
  const contract = getContract();
  if (!contract) return null;
  try {
    const agent = await contract.getAgentByName(name);
    return formatAgent(agent);
  } catch (e) {
    console.warn("[AgentNFT] Failed to get agent by name:", e.message);
    return null;
  }
}

/**
 * Get all agents from the contract by iterating token IDs 1..agentCount()
 */
async function getAllAgents() {
  const contract = getContract();
  if (!contract) return [];
  try {
    const count = await contract.agentCount();
    const total = Number(count);
    const agents = [];
    for (let i = 1; i <= total; i++) {
      try {
        const agent = await contract.getAgent(i);
        agents.push(formatAgent(agent));
      } catch (e) {
        console.warn(`[AgentNFT] Failed to get agent ${i}:`, e.message);
      }
    }
    return agents;
  } catch (e) {
    console.warn("[AgentNFT] Failed to get agent count:", e.message);
    return [];
  }
}

/**
 * Get agent stats from the DB for a specific agent token ID
 */
function getAgentStatsFromDB(tokenId) {
  const { stmts } = require("../db");
  if (!stmts.getAgentStats) return null;
  const stats = stmts.getAgentStats.get(tokenId);
  if (!stats || stats.papers_curated === 0) {
    return { papers_curated: 0, avg_score: 0, last_activity: null };
  }
  const avg_novelty = Math.round(stats.avg_novelty || 0);
  const avg_clarity = Math.round(stats.avg_clarity || 0);
  const avg_methodology = Math.round(stats.avg_methodology || 0);
  const avg_impact = Math.round(stats.avg_impact || 0);
  const avg_score = Math.round((avg_novelty + avg_clarity + avg_methodology + avg_impact) / 4);
  return {
    papers_curated: stats.papers_curated,
    avg_novelty,
    avg_clarity,
    avg_methodology,
    avg_impact,
    avg_score,
    last_activity: stats.last_activity,
  };
}

/**
 * Get recent papers curated by a specific agent
 */
function getAgentPapersFromDB(tokenId, limit = 10) {
  const { stmts } = require("../db");
  if (!stmts.getAgentPapers) return [];
  return stmts.getAgentPapers.all(tokenId).slice(0, limit).map(row => {
    let aiScore = null;
    try { aiScore = row.ai_score ? JSON.parse(row.ai_score) : null; } catch (e) {}
    return {
      paper_id: row.paper_id,
      title: row.title || row.curated_title,
      slug: row.slug,
      created_date: row.created_date,
      ai_score: aiScore,
    };
  });
}

module.exports = { getAgentById, getAgentByName, getAllAgents, getAgentStatsFromDB, getAgentPapersFromDB };
