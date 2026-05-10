/**
 * JournalPayment — On-Chain Paper Registration for Micropayments
 *
 * Registers papers on the JournalPayment smart contract so readers
 * can purchase access via micropayments.
 *
 * This is separate from PaperAnchor (which stores hashes for verification).
 * JournalPayment handles the payment side: upload, purchase, access check.
 */

const { ethers } = require("ethers");

// Lazy evaluation — read env at call time, not module load
function getRpcUrl() { return process.env.RPC_URL || "https://evmrpc.0g.ai"; }
function getPrivateKey() { return process.env.PRIVATE_KEY || ""; }
function getJournalAddress() { return process.env.CONTRACT_ADDRESS || "0xc6FD8fa40ED06D21FDCA1961B75a7170991422D0"; }

const ABI = [
  "function uploadPaper(address _author, string calldata _title, string calldata _paperHash, uint256 _price) external returns (uint256)",
  "function purchasePaper(uint256 _paperId) external payable",
  "function checkAccess(uint256 _paperId, address _reader) external view returns (bool)",
  "function getPaper(uint256 _paperId) external view returns (address author, string title, string paperHash, uint256 price, string articleHash, bool hasArticle)",
  "function paperCount() external view returns (uint256)",
  "event PaperUploaded(uint256 indexed paperId, address indexed author, string title, string paperHash, uint256 price)",
];

async function getContract() {
  const pk = getPrivateKey();
  if (!pk) throw new Error("PRIVATE_KEY not configured");
  const provider = new ethers.JsonRpcProvider(getRpcUrl());
  const wallet = new ethers.Wallet(pk, provider);
  return new ethers.Contract(getJournalAddress(), ABI, wallet);
}

/**
 * Register a paper on JournalPayment contract for micropayments.
 * Called during the upload pipeline after PaperAnchor.
 *
 * @param {string} authorWallet - Real author wallet address
 * @param {string} title - Paper title
 * @param {string} paperHash - 0G Storage hash
 * @param {string} priceWei - Price in wei
 * @returns {Promise<{journalPaperId: string, txHash: string}>}
 */
async function registerPaper(authorWallet, title, paperHash, priceWei) {
  const contract = await getContract();

  const feeData = await contract.runner.provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas * 2n;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 2n;

  const tx = await contract.uploadPaper(authorWallet, title, paperHash || "0x00", priceWei || 0, {
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  const receipt = await tx.wait();

  let journalPaperId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed?.name === "PaperUploaded") {
        journalPaperId = parsed.args.paperId.toString();
        break;
      }
    } catch (e) {}
  }

  console.log("[Journal] Paper registered. ID:", journalPaperId, "Tx:", receipt.hash);
  return { journalPaperId, txHash: receipt.hash };
}

/**
 * Get total registered paper count directly from JournalPayment contract (no indexer needed)
 * @returns {Promise<number>}
 */
async function getPaperCount() {
  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrl());
    const contract = new ethers.Contract(getJournalAddress(), ["function paperCount() view returns (uint256)"], provider);
    const count = await contract.paperCount();
    return Number(count);
  } catch {
    return 0;
  }
}

/**
 * Check if a wallet has access to a paper on-chain (via JournalPayment contract)
 * @param {number} journalId - On-chain paper ID
 * @param {string} wallet - Wallet address
 * @returns {Promise<boolean>}
 */
async function checkOnChainAccess(journalId, wallet) {
  try {
    const provider = new ethers.JsonRpcProvider(getRpcUrl());
    const contract = new ethers.Contract(getJournalAddress(), [
      "function checkAccess(uint256 _paperId, address _reader) view returns (bool)",
    ], provider);
    return await contract.checkAccess(journalId, wallet);
  } catch {
    return false;
  }
}

module.exports = { registerPaper, getPaperCount, checkOnChainAccess };
