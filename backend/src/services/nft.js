const { ethers } = require("ethers");

/**
 * ResearchNFT Minting Service
 * Gasless minting — backend sponsors gas for researchers
 */

const RPC_URL = process.env.RPC_URL || "https://evmrpc-testnet.0g.ai";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || "0x5495b92aca76B4414C698f60CdaAD85B364011a1";

const ABI = [
  "function mintResearch(address to, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI) external returns (uint256)",
  "function getResearchToken(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI, address researcher, uint256 mintedAt))",
  "function getTokenByPaper(uint256 paperId) external view returns (tuple(uint256 tokenId, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI, address researcher, uint256 mintedAt))",
  "function totalSupply() external view returns (uint256)",
  "function ownerOf(uint256 tokenId) external view returns (address)",
  "event ResearchMinted(uint256 indexed tokenId, uint256 indexed paperId, bytes32 storageRoot, address researcher, uint256 timestamp)",
];

async function getContract() {
  if (!PRIVATE_KEY) throw new Error("PRIVATE_KEY not configured");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(NFT_CONTRACT_ADDRESS, ABI, wallet);
}

/**
 * Mint a research NFT for a curated paper
 * @param {string} to - Recipient wallet address
 * @param {number} paperId - PaperAnchor on-chain ID
 * @param {string} storageRoot - 0G Storage root hash
 * @param {string} articleBody - AI-curated article content
 * @param {object} metadata - Paper metadata (title, authors, etc.)
 */
async function mintResearchNFT(to, paperId, storageRoot, articleBody, metadata) {
  const contract = await getContract();

  const curationHash = ethers.keccak256(ethers.toUtf8Bytes(articleBody || ""));
  const metadataURI = JSON.stringify({
    name: `RumahPeneliti Research #${paperId}`,
    description: metadata?.title || "Research Paper",
    attributes: [
      { trait_type: "Storage Root", value: storageRoot },
      { trait_type: "Paper ID", value: paperId.toString() },
      { trait_type: "Platform", value: "RumahPeneliti.com" },
      { trait_type: "Network", value: "0G Galileo Testnet" },
    ],
  });

  console.log("[NFT] Minting research NFT for paper:", paperId, "to:", to);

  // Get provider from contract
  const provider = contract.runner.provider;
  const feeData = await provider.getFeeData();
  const maxFeePerGas = feeData.maxFeePerGas * 2n;
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas * 2n;

  const tx = await contract.mintResearch(to, paperId, storageRoot, curationHash, metadataURI, {
    maxFeePerGas,
    maxPriorityFeePerGas,
  });
  const receipt = await tx.wait();

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

async function getTotalSupply() {
  const contract = await getContract();
  const supply = await contract.totalSupply();
  return Number(supply);
}

module.exports = { mintResearchNFT, getNFTByPaper, getTotalSupply };
