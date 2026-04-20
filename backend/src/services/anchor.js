const { ethers } = require("ethers");

/**
 * PaperAnchor on-chain service
 * Anchors paper hashes to PaperAnchor smart contract on 0G testnet
 */

const RPC_URL = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const PAPER_ANCHOR_ADDRESS = process.env.PAPER_ANCHOR_ADDRESS || "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE";

const ABI = [
  "function anchorPaper(bytes32 storageRoot, bytes32 curationHash, bytes32 metadataHash) external returns (uint256)",
  "function setArticle(uint256 paperId, bytes32 articleHash) external",
  "function getPaper(uint256 paperId) external view returns (tuple(uint256 id, bytes32 storageRoot, bytes32 curationHash, bytes32 metadataHash, address author, uint256 timestamp, bool hasArticle, uint256 citationCount))",
  "function verifyPaper(uint256 paperId, bytes32 storageRoot) external view returns (bool)",
  "event PaperAnchored(uint256 indexed id, bytes32 indexed storageRoot, bytes32 curationHash, bytes32 metadataHash, address author, uint256 timestamp)",
];

function toBytes32(str) {
  if (!str) return ethers.ZeroHash;
  return ethers.keccak256(ethers.toUtf8Bytes(str));
}

async function getContract() {
  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not configured");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(PAPER_ANCHOR_ADDRESS, ABI, wallet);
}

/**
 * Anchor a paper to the blockchain
 * @param {string} storageRootHex - 0G Storage root hash (0x...)
 * @param {string} title - Paper title
 * @param {string} authors - Paper authors
 * @param {string} abstract - Paper abstract
 * @returns {Promise<{paperId: number, txHash: string}>}
 */
async function anchorPaper(storageRootHex, title, authors, abstract) {
  const contract = await getContract();

  const storageRoot = storageRootHex || ethers.ZeroHash;
  const metadataHash = toBytes32(JSON.stringify({ title, authors, abstract }));
  const curationHash = ethers.ZeroHash; // Will be set after AI curation

  console.log("[Anchor] Anchoring paper:", title);
  console.log("[Anchor] Storage root:", storageRoot);

  const tx = await contract.anchorPaper(storageRoot, curationHash, metadataHash);
  const receipt = await tx.wait();

  // Parse PaperAnchored event to get paperId
  let paperId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed?.name === "PaperAnchored") {
        paperId = parsed.args.id.toString();
        break;
      }
    } catch (e) {}
  }

  console.log("[Anchor] Paper anchored. ID:", paperId, "Tx:", receipt.hash);
  return { paperId, txHash: receipt.hash };
}

/**
 * Set article curation hash on-chain
 */
async function anchorArticle(paperId, articleContent) {
  const contract = await getContract();
  const articleHash = toBytes32(articleContent);

  const tx = await contract.setArticle(paperId, articleHash);
  const receipt = await tx.wait();

  console.log("[Anchor] Article anchored. Paper:", paperId, "Tx:", receipt.hash);
  return { txHash: receipt.hash };
}

/**
 * Verify paper integrity on-chain
 */
async function verifyPaperOnChain(paperId, storageRoot) {
  const contract = await getContract();
  return contract.verifyPaper(paperId, storageRoot);
}

module.exports = { anchorPaper, anchorArticle, verifyPaperOnChain };
