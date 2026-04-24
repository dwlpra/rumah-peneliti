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

// Konfigurasi koneksi blockchain
const RPC_URL = process.env.RPC_URL || "https://evmrpc.0g.ai";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x5495b92aca76B4414C698f60CdaAD85B364011a1";

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
 * Buat koneksi ke smart contract NFT
 * @returns {ethers.Contract} - Instance contract yang siap dipanggil
 */
async function getContract() {
  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not configured");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, wallet);
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
  return { tokenId, txHash: receipt.hash, contractAddress: NFT_CONTRACT_ADDRESS };
}

/**
 * Ambil data NFT berdasarkan paper ID
 * @param {number} paperId - ID on-chain paper
 * @returns {Promise<object>} - Data NFT (tokenId, researcher, dll)
 */
async function getNFTByPaper(paperId) {
  const contract = await getContract();
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
  const contract = await getContract();
  const supply = await contract.totalSupply();
  return Number(supply);
}

module.exports = { mintResearchNFT, getNFTByPaper, getTotalSupply };
