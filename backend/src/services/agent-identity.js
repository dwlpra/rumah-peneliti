/**
 * Agent Identity Service
 *
 * Reads on-chain AI Agent identity from the 0G Agentic ID (ERC-7857) contract.
 * Agent metadata (name, type, model, capabilities) comes from agent-config.js.
 * On-chain data (Intelligent Data, ownership) comes from AgenticID contract.
 *
 * DB stats and TipJar functions are preserved from the old agent-nft.js.
 * Token ID mapping: AgenticID tokens are 0-indexed (0-3), replacing old AgentNFT (1-4).
 */

const { ethers } = require("ethers");
const { AGENTS, getAgentConfig } = require("./agent-config");

// Lazy evaluation — read env at call time, not module load
function getRpcUrl() { return process.env.RPC_URL || process.env.ZERO_MAINNET_RPC || "https://evmrpc.0g.ai"; }
function getAgenticIdAddress() { return process.env.AGENTIC_ID_ADDRESS || "0x82c5e31880929de181E5DF78D60f342168d18115"; }
function getTipJarAddress() { return process.env.AGENT_TIP_JAR_ADDRESS || ""; }

const AGENTIC_ID_ABI = [
  "function getIntelligentDatas(uint256 tokenId) external view returns (tuple(string dataDescription, bytes32 dataHash)[] memory)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function totalSupply() external view returns (uint256)",
  "function tokenCreator(uint256 tokenId) external view returns (address)",
];

const TIP_JAR_ABI = [
  "function getAgentStats(uint256 tokenId) external view returns (uint256 balance, uint256 totalTips, uint256 tipCount)",
  "function withdraw(uint256 tokenId) external",
];

let _contract = null;
let _tipJar = null;
let _cachedRpcUrl = null;

function getContract() {
  const addr = getAgenticIdAddress();
  const rpc = getRpcUrl();
  if (!addr) return null;
  if (!_contract || _cachedRpcUrl !== rpc) {
    const provider = new ethers.JsonRpcProvider(rpc);
    _contract = new ethers.Contract(addr, AGENTIC_ID_ABI, provider);
    _cachedRpcUrl = rpc;
  }
  return _contract;
}

function getTipJar() {
  const addr = getTipJarAddress();
  const rpc = getRpcUrl();
  if (!addr) return null;
  if (!_tipJar || _cachedRpcUrl !== rpc) {
    const provider = new ethers.JsonRpcProvider(rpc);
    _tipJar = new ethers.Contract(addr, TIP_JAR_ABI, provider);
  }
  return _tipJar;
}

/**
 * Get a single agent by AgenticID token ID (0-3)
 * Merges static config + on-chain AgenticID data
 */
async function getAgentById(tokenId) {
  const config = getAgentConfig(parseInt(tokenId));
  if (!config) return null;

  const contract = getContract();
  let onChainData = null;
  if (contract) {
    try {
      const [intelligentData, owner, creator] = await Promise.all([
        contract.getIntelligentDatas(tokenId).catch(() => []),
        contract.ownerOf(tokenId).catch(() => null),
        contract.tokenCreator(tokenId).catch(() => null),
      ]);

      onChainData = {
        owner,
        creator,
        intelligentData: intelligentData.map(d => ({
          description: d.dataDescription,
          hash: d.dataHash,
        })),
      };
    } catch (e) {
      console.warn("[AgentIdentity] Failed to read on-chain data for token", tokenId, ":", e.message);
    }
  }

  return {
    tokenId: tokenId.toString(),
    name: config.name,
    description: config.description,
    agentType: config.type === "Kurator" ? 0 : config.type === "Summarizer" ? 2 : config.type === "Scorer" ? 1 : 3,
    agentTypeName: config.type,
    model: config.model,
    capabilities: config.capabilities,
    active: true,
    contractAddress: getAgenticIdAddress(),
    onChainData,
  };
}

/**
 * Get all agents
 */
async function getAllAgents() {
  const agents = [];
  for (const config of AGENTS) {
    const agent = await getAgentById(config.agenticId);
    if (agent) agents.push(agent);
  }
  return agents;
}

/**
 * Get agent stats from the DB for a specific agent token ID.
 * Uses AgenticID token IDs (0-3). All 4 pipeline agents collaborate on every paper.
 * We query using token 0 (Kurator) as the lead and weight scores by specialty.
 */
function getAgentStatsFromDB(tokenId) {
  const { stmts } = require("../db");
  if (!stmts.getAgentStats) return null;

  // All 4 agents collaborate on every paper — Kurator (#0) orchestrates,
  // Summarizer (#1), Scorer (#2), Tagger (#3) run in parallel.
  // Every article is the result of all agents working together,
  // so stats are shared across all agents.
  let stats = stmts.getAgentStats.get(0); // Always query by lead agent (Kurator #0)
  if (!stats || stats.papers_curated === 0) {
    return { papers_curated: 0, avg_score: 0, last_activity: null };
  }

  const avg_novelty = Math.round(stats.avg_novelty || 0);
  const avg_clarity = Math.round(stats.avg_clarity || 0);
  const avg_methodology = Math.round(stats.avg_methodology || 0);
  const avg_impact = Math.round(stats.avg_impact || 0);

  // Each agent specializes in a dimension — give a small boost to their specialty
  // Token 0 (Kurator): overall, Token 1 (Summarizer): clarity, Token 2 (Scorer): methodology, Token 3 (Tagger): novelty
  let boost = { novelty: 0, clarity: 0, methodology: 0, impact: 0 };
  if (tokenId === 1) boost.clarity = 5;
  else if (tokenId === 2) boost.methodology = 5;
  else if (tokenId === 3) boost.novelty = 5;
  else if (tokenId === 0) boost.impact = 3;

  const final_novelty = Math.min(100, avg_novelty + boost.novelty);
  const final_clarity = Math.min(100, avg_clarity + boost.clarity);
  const final_methodology = Math.min(100, avg_methodology + boost.methodology);
  const final_impact = Math.min(100, avg_impact + boost.impact);

  let avg_score;
  if (tokenId === 0) {
    avg_score = Math.round((final_novelty + final_clarity + final_methodology + final_impact) / 4);
  } else if (tokenId === 1) {
    avg_score = Math.round((final_novelty + final_clarity * 2 + final_methodology + final_impact) / 5);
  } else if (tokenId === 2) {
    avg_score = Math.round((final_novelty + final_clarity + final_methodology * 2 + final_impact) / 5);
  } else if (tokenId === 3) {
    avg_score = Math.round((final_novelty * 2 + final_clarity + final_methodology + final_impact) / 5);
  } else {
    avg_score = Math.round((final_novelty + final_clarity + final_methodology + final_impact) / 4);
  }

  return {
    papers_curated: stats.papers_curated,
    avg_novelty: final_novelty,
    avg_clarity: final_clarity,
    avg_methodology: final_methodology,
    avg_impact: final_impact,
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

  // Try new token ID first, then fall back to old AgentNFT ID for backward compat
  let papers = stmts.getAgentPapers.all(tokenId).slice(0, limit);
  if (papers.length === 0) {
    const oldId = tokenId + 1;
    papers = stmts.getAgentPapers.all(oldId).slice(0, limit);
  }

  return papers.map(row => {
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

/**
 * Get on-chain tip stats for an agent from AgentTipJar contract
 */
async function getAgentTipStats(tokenId) {
  const tipJar = getTipJar();
  if (!tipJar || tokenId == null) return { tipBalance: "0", totalTips: "0", tipCount: 0 };
  try {
    const stats = await tipJar.getAgentStats(tokenId);
    return {
      tipBalance: ethers.formatEther(stats.balance),
      totalTips: ethers.formatEther(stats.totalTips),
      tipCount: Number(stats.tipCount),
      tipJarAddress: getTipJarAddress(),
    };
  } catch (e) {
    console.warn("[AgentTipJar] Failed to get tip stats:", e.message);
    return { tipBalance: "0", totalTips: "0", tipCount: 0 };
  }
}

/**
 * Withdraw accumulated tips from AgentTipJar for all agents owned by the backend wallet.
 * Uses AgenticID token IDs (0-3).
 */
async function withdrawAgentTips() {
  const tipJarAddr = getTipJarAddress();
  const pk = process.env.PRIVATE_KEY;
  if (!tipJarAddr || !pk) return 0;

  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrl());
    const wallet = new ethers.Wallet(pk, provider);
    const tipJar = new ethers.Contract(tipJarAddr, TIP_JAR_ABI, wallet);

    let totalWithdrawn = 0;
    for (let i = 0; i < AGENTS.length; i++) {
      try {
        const stats = await tipJar.getAgentStats(i);
        const balance = stats.balance;
        if (balance > 0n) {
          console.log(`[AgentTipJar] Withdrawing ${ethers.formatEther(balance)} 0G from agent #${i}`);
          const tx = await tipJar.withdraw(i);
          await tx.wait();
          totalWithdrawn += Number(ethers.formatEther(balance));
          console.log(`[AgentTipJar] Withdrawn from agent #${i}, tx: ${tx.hash}`);
        }
      } catch (e) {
        console.warn(`[AgentTipJar] Withdraw failed for agent #${i}:`, e.message);
      }
    }

    if (totalWithdrawn > 0) {
      console.log(`[AgentTipJar] Total recycled to operator wallet: ${totalWithdrawn.toFixed(6)} 0G`);
    }
    return totalWithdrawn;
  } catch (e) {
    console.warn("[AgentTipJar] withdrawAgentTips failed:", e.message);
    return 0;
  }
}

module.exports = { getAgentById, getAllAgents, getAgentStatsFromDB, getAgentPapersFromDB, getAgentTipStats, withdrawAgentTips };
