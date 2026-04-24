/**
 * ============================================================
 *  PaperAnchor — On-Chain Paper Verification
 * ============================================================
 *
 *  Smart contract PaperAnchor menyimpan hash paper di blockchain 0G.
 *  Ini membuat record immutable yang bisa diverifikasi siapa saja.
 *
 *  Alur:
 *    1. Saat paper di-upload, hash-nya di-anchor ke blockchain
 *    2. Setelah AI curation selesai, hash artikel juga di-anchor
 *    3. Siapa saja bisa verifikasi: "apakah paper ini asli?"
 *
 *  Analogi sederhana:
 *    Anchor = "Notaris" — mencatat hash paper sebagai bukti
 *    bahwa paper ini benar-benar ada dan tidak diubah sejak di-upload.
 *
 *  3 jenis hash yang disimpan:
 *    - storageRoot: Hash file di 0G Storage (bukti file tersimpan)
 *    - curationHash: Hash artikel AI (bukti kurasi asli)
 *    - metadataHash: Hash metadata (judul, penulis, abstrak)
 *
 * ============================================================
 */

const { ethers } = require("ethers");

// Konfigurasi koneksi blockchain
const RPC_URL = process.env.RPC_URL || "https://evmrpc.0g.ai";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const PAPER_ANCHOR_ADDRESS = process.env.PAPER_ANCHOR_ADDRESS || "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE";

// ABI (interface) smart contract — fungsi-fungsi yang bisa dipanggil
const ABI = [
  "function anchorPaper(bytes32 storageRoot, bytes32 curationHash, bytes32 metadataHash) external returns (uint256)",
  "function setArticle(uint256 paperId, bytes32 articleHash) external",
  "function getPaper(uint256 paperId) external view returns (tuple(uint256 id, bytes32 storageRoot, bytes32 curationHash, bytes32 metadataHash, address author, uint256 timestamp, bool hasArticle, uint256 citationCount))",
  "function verifyPaper(uint256 paperId, bytes32 storageRoot) external view returns (bool)",
  "event PaperAnchored(uint256 indexed id, bytes32 indexed storageRoot, bytes32 curationHash, bytes32 metadataHash, address author, uint256 timestamp)",
];

/**
 * Konversi string ke bytes32 (hash 32 byte)
 * Dipakai untuk mengubah teks menjadi format yang bisa disimpan di blockchain.
 *
 * @param {string} str - Teks yang mau di-hash
 * @returns {string} - Hash bytes32 (format 0x...)
 */
function toBytes32(str) {
  if (!str) return ethers.ZeroHash;  // String kosong = hash nol
  return ethers.keccak256(ethers.toUtf8Bytes(str));
}

/**
 * Buat koneksi ke smart contract
 * @returns {ethers.Contract} - Instance contract yang siap dipanggil
 */
async function getContract() {
  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not configured");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(PAPER_ANCHOR_ADDRESS, ABI, wallet);
}

/**
 * Anchor paper ke blockchain
 *
 * Menyimpan 3 hash ke smart contract:
 *   - storageRoot: Hash file di 0G Storage
 *   - curationHash: Hash artikel AI (kosong dulu, diisi nanti)
 *   - metadataHash: Hash metadata (judul, penulis, abstrak)
 *
 * @param {string} storageRootHex - 0G Storage root hash (format 0x...)
 * @param {string} title - Judul paper
 * @param {string} authors - Nama penulis
 * @param {string} abstract - Abstrak paper
 * @returns {Promise<{paperId: number, txHash: string}>}
 *   - paperId: ID on-chain paper (auto-increment dari contract)
 *   - txHash: Hash transaksi blockchain
 */
async function anchorPaper(storageRootHex, title, authors, abstract) {
  const contract = await getContract();

  const storageRoot = storageRootHex || ethers.ZeroHash;
  const metadataHash = toBytes32(JSON.stringify({ title, authors, abstract }));
  const curationHash = ethers.ZeroHash; // Diisi nanti setelah AI curation

  console.log("[Anchor] Anchoring paper:", title);
  console.log("[Anchor] Storage root:", storageRoot);

  // Kirim transaksi ke smart contract
  const tx = await contract.anchorPaper(storageRoot, curationHash, metadataHash);
  const receipt = await tx.wait();

  // Baca event PaperAnchored dari receipt untuk mendapatkan paperId
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
 * Anchor artikel AI ke blockchain
 *
 * Setelah AI selesai mengurasi paper, hash dari artikel AI
 * disimpan di blockchain sebagai bukti bahwa kurasi asli.
 *
 * @param {number} paperId - ID on-chain paper
 * @param {string} articleContent - Isi artikel hasil AI curation
 * @returns {Promise<{txHash: string}>}
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
 * Verifikasi integritas paper on-chain
 *
 * Cek apakah storageRoot yang diberikan cocok dengan yang tersimpan
 * di blockchain. Ini memastikan paper tidak diubah setelah di-upload.
 *
 * @param {number} paperId - ID on-chain paper
 * @param {string} storageRoot - Hash storage yang mau diverifikasi
 * @returns {Promise<boolean>} - true jika cocok (paper asli)
 */
async function verifyPaperOnChain(paperId, storageRoot) {
  const contract = await getContract();
  return contract.verifyPaper(paperId, storageRoot);
}

module.exports = { anchorPaper, anchorArticle, verifyPaperOnChain };
