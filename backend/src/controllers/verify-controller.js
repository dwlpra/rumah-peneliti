/**
 * Verify Controller
 *
 * Handles verification of paper ID, transaction hash, or storage root.
 * Primary source: SQLite DB. Ponder enrichment optional.
 */

const { stmts, getArticle: getArticleStmt } = require("../db");
const { getPaperOnChainData } = require("../utils/ponder");

function resolvePaperId(param) {
  if (/^\d+$/.test(param)) return parseInt(param);
  const paper = stmts.getPaperBySlug.get(param);
  return paper ? paper.id : null;
}

/**
 * Search papers by tx hash (anchor or NFT) or storage root
 */
function findPaperByHash(hash) {
  const h = hash.toLowerCase();

  // Try anchor tx hash
  let paper = stmts.findPaperByAnchorTx?.get(h);
  if (paper) return paper;

  // Try NFT tx hash
  paper = stmts.findPaperByNftTx?.get(h);
  if (paper) return paper;

  // Try storage root hash
  paper = stmts.findPaperByStorageHash?.get(h);
  if (paper) return paper;

  return null;
}

/**
 * Build on-chain data response from a paper row
 */
function buildResponse(paperId) {
  const paper = stmts.getPaper.get(paperId);
  if (!paper) return null;

  const result = {
    paperId,
    title: paper.title,
    anchor: null,
    nft: null,
    articleAnchors: [],
    explorerBase: "https://chainscan.0g.ai",
  };

  if (paper.storage_hash || paper.anchor_tx_hash) {
    result.anchor = {
      paperId,
      storageRoot: paper.storage_hash || null,
      txHash: paper.anchor_tx_hash || null,
    };
  }

  if (paper.nft_token_id) {
    result.nft = {
      tokenId: paper.nft_token_id,
      paperId,
      txHash: paper.nft_tx_hash || null,
    };
  }

  const article = stmts.getArticle.get(paperId);
  if (article) {
    result.articleAnchors = [{ paperId }];
  }

  // Enrich with Ponder data (timestamps, block numbers)
  try {
    // Fire and forget — don't block the response
    getPaperOnChainData(paperId).then((ponderData) => {
      if (ponderData?.anchor && result.anchor) {
        result.anchor.blockNumber = ponderData.anchor.blockNumber;
        result.anchor.timestamp = ponderData.anchor.timestamp;
      }
      if (ponderData?.nft && result.nft) {
        result.nft.researcher = ponderData.nft.researcher;
        result.nft.blockNumber = ponderData.nft.blockNumber;
      }
    }).catch(() => {});
  } catch {}

  return result;
}

async function verify(req, res) {
  const q = (req.query.q || req.params.hash || "").trim();
  if (!q) return res.status(400).json({ error: "Empty query" });

  // 1. Try as paper ID (numeric) or slug
  const paperId = resolvePaperId(q);
  if (paperId) {
    const data = buildResponse(paperId);
    if (data) return res.json(data);
  }

  // 2. Try as hash (0x...) — search anchor tx, NFT tx, storage root
  if (q.startsWith("0x")) {
    const paper = findPaperByHash(q);
    if (paper) {
      const data = buildResponse(paper.id);
      if (data) return res.json(data);
    }
  }

  // Not found
  res.json({
    paperId: null,
    title: null,
    anchor: null,
    nft: null,
    articleAnchors: [],
    explorerBase: "https://chainscan.0g.ai",
  });
}

module.exports = { verify };
