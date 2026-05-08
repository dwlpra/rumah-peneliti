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
function getJournalAddress() { return process.env.CONTRACT_ADDRESS || "0xF5E23E98a6a93Db2c814a033929F68D5B74445E2"; }

const ABI = [
  "function uploadPaper(string calldata _title, string calldata _paperHash, uint256 _price) external returns (uint256)",
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
 * @param {string} title - Paper title
 * @param {string} paperHash - 0G Storage hash
 * @param {string} priceWei - Price in wei
 * @returns {Promise<{journalPaperId: string, txHash: string}>}
 */
async function registerPaper(title, paperHash, priceWei) {
  const contract = await getContract();

  const feeData = await contract.runner.provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas * 2n;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 2n;

  const tx = await contract.uploadPaper(title, paperHash || "0x00", priceWei || 0, {
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

module.exports = { registerPaper };
