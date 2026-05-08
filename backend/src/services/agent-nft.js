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

module.exports = { getAgentById, getAgentByName };
