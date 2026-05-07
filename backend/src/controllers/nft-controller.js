/**
 * NFT Controller
 *
 * Business logic untuk operasi NFT:
 *   - Manual mint NFT (untuk paper yang gagal di pipeline)
 *   - Get NFT info by paper
 *   - NFT stats
 */

const { stmts, parseArticle } = require("../db");
const { mintResearchNFT, getNFTByPaper, getTotalSupply, getAllNFTs } = require("../services/nft");

/**
 * Manual mint NFT untuk paper yang sudah ada
 *
 * Dipakai kalau pipeline gagal di step 6 (NFT minting).
 * Syarat: paper sudah punya storage hash + artikel AI.
 */
async function mintPaperNFT(req, res) {
  const paper = stmts.getPaper.get(req.params.id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });
  if (!paper.storage_hash) return res.status(400).json({ error: "Paper not stored on 0G" });

  const article = parseArticle(stmts.getArticle.get(req.params.id));
  if (!article) return res.status(400).json({ error: "No curated article yet" });

  const { recipient } = req.body;
  const to = recipient || paper.author_wallet || "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55";

  const result = await mintResearchNFT(to, Number(req.params.id), paper.storage_hash, article.body, {
    title: paper.title,
    authors: paper.authors,
    abstract: paper.abstract,
  });

  res.json({ success: true, nft: result });
}

/** Get NFT info untuk paper tertentu */
async function getPaperNFT(req, res) {
  const nft = await getNFTByPaper(Number(req.params.id));
  res.json(nft);
}

/** Get NFT stats (total supply, contract address) */
async function getNFTStats(req, res) {
  try {
    const total = await getTotalSupply();
    res.json({
      totalSupply: total,
      contract: process.env.NFT_CONTRACT_ADDRESS,
    });
  } catch (err) {
    console.error("[NFT] Stats error:", err.message);
    res.json({
      totalSupply: 0,
      contract: process.env.NFT_CONTRACT_ADDRESS,
      error: "Contract read failed — deployed version may differ from local code",
    });
  }
}

/** Get all minted NFTs from the contract (no indexer needed) */
async function listNFTs(req, res) {
  try {
    const nfts = await getAllNFTs();
    // Enrich with paper data from local DB
    const enriched = nfts.map((nft) => {
      const paper = stmts.getPaper.get(Number(nft.paperId));
      return {
        ...nft,
        slug: paper?.slug || null,
        paperTitle: paper?.title || null,
      };
    });
    res.json({ nfts: enriched, total: enriched.length });
  } catch (err) {
    console.error("[NFT] List error:", err.message);
    res.json({ nfts: [], total: 0 });
  }
}

module.exports = { mintPaperNFT, getPaperNFT, getNFTStats, listNFTs };
