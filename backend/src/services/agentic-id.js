/**
 * 0G Agentic ID Service (ERC-7857)
 *
 * Reads on-chain AI Agent identity from the official 0G AgenticID contract.
 * Provides verifiable agent identity — model, capabilities, prompts hashed on-chain.
 */

const { ethers } = require("ethers");

function getRpcUrl() { return process.env.RPC_URL || "https://evmrpc.0g.ai"; }
function getAgenticIdAddress() { return process.env.AGENTIC_ID_ADDRESS || ""; }

const ABI = [
  "function getIntelligentDatas(uint256 tokenId) external view returns (tuple(string dataDescription, bytes32 dataHash)[] memory)",
  "function tokenURI(uint256 tokenId) external view returns (string)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "function totalSupply() external view returns (uint256)",
  "function tokenCreator(uint256 tokenId) external view returns (address)",
  "function cloneSource(uint256 tokenId) external view returns (uint256)",
  "function authorizedUsersOf(uint256 tokenId) external view returns (address[] memory)",
];

let _contract = null;
let _cachedRpc = null;

function getContract() {
  const addr = getAgenticIdAddress();
  const rpc = getRpcUrl();
  if (!addr) return null;
  if (!_contract || _cachedRpc !== rpc) {
    const provider = new ethers.JsonRpcProvider(rpc);
    _contract = new ethers.Contract(addr, ABI, provider);
    _cachedRpc = rpc;
  }
  return _contract;
}

/**
 * Get verified Agentic ID data for an agent token
 */
async function getAgenticIdInfo(tokenId) {
  const contract = getContract();
  if (!contract || tokenId == null) return null;
  try {
    const [intelligentData, uri, owner, creator] = await Promise.all([
      contract.getIntelligentDatas(tokenId),
      contract.tokenURI(tokenId),
      contract.ownerOf(tokenId),
      contract.tokenCreator(tokenId),
    ]);

    let metadata = {};
    try { metadata = JSON.parse(uri); } catch {}

    const capabilities = intelligentData
      .filter(d => d.dataDescription.startsWith("capability:"))
      .map(d => d.dataDescription.replace("capability:", ""));

    const model = intelligentData
      .find(d => d.dataDescription.startsWith("model:"))
      ?.dataDescription.replace("model:", "") || null;

    return {
      tokenId: tokenId.toString(),
      contractAddress: getAgenticIdAddress(),
      owner,
      creator,
      name: metadata.name || `Agent #${tokenId}`,
      description: metadata.description || "",
      agentType: metadata.agentType || "",
      version: metadata.version || "",
      model,
      capabilities,
      intelligentData: intelligentData.map(d => ({
        description: d.dataDescription,
        hash: d.dataHash,
      })),
      explorerUrl: `https://chainscan.0g.ai/address/${getAgenticIdAddress()}?tab=token_instance&token_id=${tokenId}`,
      verified: true,
    };
  } catch (e) {
    console.warn("[AgenticID] Failed to get info for token", tokenId, ":", e.message);
    return null;
  }
}

/**
 * Get all 4 pipeline agents' Agentic ID info
 */
async function getAllAgenticIds() {
  const contract = getContract();
  if (!contract) return [];
  try {
    const total = Number(await contract.totalSupply());
    const agents = [];
    for (let i = 0; i < total; i++) {
      const info = await getAgenticIdInfo(i);
      if (info) agents.push(info);
    }
    return agents;
  } catch (e) {
    console.warn("[AgenticID] Failed:", e.message);
    return [];
  }
}

module.exports = { getAgenticIdInfo, getAllAgenticIds, getAgenticIdAddress };
