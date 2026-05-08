/**
 * ============================================================
 *  ResearchNFT — NFT Minting Service (Gasless)
 * ============================================================
 *
 *  Setiap paper yang dikurasi AI mendapat NFT ERC-721 sebagai
 *  bukti publikasi yang permanen dan bisa diperjualbelikan.
 *
 *  Fitur utama: GASLESS
 *    Backend membayar semua gas fee untuk minting NFT.
 *    Penulis tidak perlu punya token atau bayar apa-apa.
 *
 *  Cara kerja:
 *    1. Siapkan metadata NFT (judul, storage hash, dll)
 *    2. Hitung hash dari artikel AI (curationHash)
 *    3. Panggil fungsi mintResearch() di smart contract
 *    4. Bayar gas 2x lipat dari normal (biar pasti ke-confirm)
 *    5. Baca tokenId dari event ResearchMinted
 *
 *  Analogi sederhana:
 *    NFT = "Sertifikat digital" yang membuktikan kamu mempublikasi
 *    paper ini. Seperti sertifikat paten, tapi di blockchain.
 *
 * ============================================================
 */

const { ethers } = require("ethers");

// Konfigurasi koneksi blockchain — lazy evaluation (read at call time, not module load)
// This ensures dotenv has loaded before we try to read env vars
function getRpcUrl() { return process.env.RPC_URL || "https://evmrpc.0g.ai"; }
function getPrivateKey() { return process.env.PRIVATE_KEY || ""; }
function getNFTAddress() { return process.env.NFT_CONTRACT_ADDRESS || "0x5495b92aca76B4414C698f60CdaAD85B364011a1"; }

// ABI (interface) smart contract ResearchNFT
const ABI = [
  "function mintResearch(address to, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI) external returns (uint256)",
  "function getResearchToken(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI, address researcher, uint256 mintedAt))",
  "function getTokenByPaper(uint256 paperId) external view returns (tuple(uint256 tokenId, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI, address researcher, uint256 mintedAt))",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event ResearchMinted(uint256 indexed tokenId, uint256 indexed paperId, bytes32 storageRoot, address researcher, uint256 timestamp)",
];

/**
 * Buat koneksi read-only ke smart contract NFT (tanpa signer)
 * Untuk operasi baca: totalSupply, getTokenByPaper, dll
 * @returns {ethers.Contract} - Instance contract read-only
 */
function getReadContract() {
  const provider = new ethers.JsonRpcProvider(getRpcUrl());
  return new ethers.Contract(getNFTAddress(), ABI, provider);
}

/**
 * Buat koneksi ke smart contract NFT dengan signer
 * Untuk operasi tulis: mintResearch
 * @returns {ethers.Contract} - Instance contract yang siap dipanggil
 */
async function getContract() {
  const pk = getPrivateKey();
  if (!pk) throw new Error("PRIVATE_KEY not configured");
  const provider = new ethers.JsonRpcProvider(getRpcUrl());
  const wallet = new ethers.Wallet(pk, provider);
  return new ethers.Contract(getNFTAddress(), ABI, wallet);
}

/**
 * Mint NFT untuk paper riset
 *
 * Proses:
 *   1. Buat curationHash (hash dari artikel AI)
 *   2. Buat metadata JSON (judul, storage hash, paper ID)
 *   3. Kirim transaksi mint ke smart contract
 *   4. Bayar gas 2x lipat (biar pasti confirm, tidak stuck)
 *   5. Baca tokenId dari event ResearchMinted
 *
 * @param {string} to - Wallet address penerima NFT (biasanya penulis)
 * @param {number} paperId - ID on-chain paper dari PaperAnchor contract
 * @param {string} storageRoot - Hash file di 0G Storage
 * @param {string} articleBody - Isi artikel hasil AI curation
 * @param {object} metadata - Metadata paper { title, authors, abstract }
 * @returns {Promise<{tokenId: string, txHash: string, contractAddress: string}>}
 */
async function mintResearchNFT(to, paperId, storageRoot, articleBody, metadata) {
  const contract = await getContract();
  const readContract = getReadContract();

  // Pre-check: skip mint if NFT already exists for this paper
  try {
    const existing = await readContract.getTokenByPaper(paperId);
    if (existing && existing.tokenId > 0n) {
      console.log("[NFT] NFT already exists for paper:", paperId, "tokenId:", existing.tokenId.toString());
      return { tokenId: existing.tokenId.toString(), txHash: null, contractAddress: getNFTAddress(), skipped: true };
    }
  } catch (e) {
    // getTokenByPaper reverts if no NFT — that's fine, proceed with mint
  }

  // Hash dari artikel AI — ini yang disimpan di NFT sebagai bukti kurasi
  const curationHash = ethers.keccak256(ethers.toUtf8Bytes(articleBody || ""));

  // Metadata NFT dalam format JSON (seperti OpenSea metadata standard)
  const metadataURI = JSON.stringify({
    name: `RumahPeneliti Research #${paperId}`,
    description: metadata?.title || "Research Paper",
    attributes: [
      { trait_type: "Storage Root", value: storageRoot },
      { trait_type: "Paper ID", value: paperId.toString() },
      { trait_type: "Platform", value: "RumahPeneliti.com" },
      { trait_type: "Network", value: "0G Mainnet" },
    ],
  });

  console.log("[NFT] Minting research NFT for paper:", paperId, "to:", to);

  // ── Hitung gas fee (2x lipat dari market rate) ──
  // Kenapa 2x? Biar transaksi pasti masuk blok dan tidak stuck di mempool.
  // Backend sponsor semua biaya, jadi user tidak perlu bayar.
  const provider = contract.runner.provider;
  const feeData = await provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas * 2n;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 2n;

  // Kirim transaksi mint ke smart contract
  const tx = await contract.mintResearch(to, paperId, storageRoot, curationHash, metadataURI, {
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  const receipt = await tx.wait();

  // Baca event ResearchMinted dari receipt untuk mendapatkan tokenId
  let tokenId = null;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
      if (parsed?.name === "ResearchMinted") {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch (e) {}
  }

  console.log("[NFT] Minted! Token:", tokenId, "Tx:", receipt.hash);
  return { tokenId, txHash: receipt.hash, contractAddress: getNFTAddress() };
}

/**
 * Ambil data NFT berdasarkan paper ID
 * @param {number} paperId - ID on-chain paper
 * @returns {Promise<object>} - Data NFT (tokenId, researcher, dll)
 */
async function getNFTByPaper(paperId) {
  const contract = getReadContract();
  const token = await contract.getTokenByPaper(paperId);
  return {
    tokenId: token.tokenId.toString(),
    paperId: token.paperId.toString(),
    storageRoot: token.storageRoot,
    researcher: token.researcher,
    mintedAt: token.mintedAt.toString(),
  };
}

/**
 * Ambil total jumlah NFT yang sudah dicetak
 * @returns {Promise<number>} - Total supply
 */
async function getTotalSupply() {
  const contract = getReadContract();
  const supply = await contract.totalSupply();
  return Number(supply);
}

/**
 * Get all minted NFTs directly from the contract (no indexer needed)
 * @returns {Promise<Array>} - Array of NFT data
 */
async function getAllNFTs() {
  const contract = getReadContract();
  const supply = await contract.totalSupply();
  const total = Number(supply);
  const nfts = [];
  for (let i = 1; i <= total; i++) {
    try {
      const token = await contract.getResearchToken(i);
      nfts.push({
        tokenId: token.tokenId.toString(),
        paperId: token.paperId.toString(),
        storageRoot: token.storageRoot,
        researcher: token.researcher,
        timestamp: token.mintedAt.toString(),
      });
    } catch (e) {
      console.error(`[NFT] Error reading token #${i}:`, e.message);
    }
  }
  return nfts;
}

module.exports = { mintResearchNFT, getNFTByPaper, getTotalSupply, getAllNFTs };
