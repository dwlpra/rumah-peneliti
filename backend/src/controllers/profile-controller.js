/**
 * Profile Controller
 *
 * Business logic untuk halaman profil user:
 *   - Paper yang ditulis
 *   - Paper yang dibeli
 *   - Data on-chain (anchor, NFT, payment events)
 */

const { db } = require("../db");
const { getWalletEvents } = require("../utils/ponder");

/** Get profile data berdasarkan wallet address */
async function getProfile(req, res) {
  const address = req.params.address.toLowerCase();

  // Data dari database lokal
  const authoredPapers = db.prepare(
    "SELECT p.*, a.curated_title, a.summary " +
    "FROM papers p LEFT JOIN articles a ON p.id = a.paper_id " +
    "WHERE LOWER(p.author_wallet) = ? ORDER BY p.upload_date DESC"
  ).all(address);

  const purchases = db.prepare(
    "SELECT pr.*, p.title as paper_title, a.curated_title " +
    "FROM purchases pr " +
    "LEFT JOIN papers p ON pr.paper_id = p.id " +
    "LEFT JOIN articles a ON pr.paper_id = a.paper_id " +
    "WHERE LOWER(pr.buyer_wallet) = ? ORDER BY pr.purchase_date DESC"
  ).all(address);

  // Data on-chain dari Ponder indexer
  let onChain = { anchors: [], nfts: [], payments: [] };
  try {
    onChain = await getWalletEvents(address);
  } catch (_) {}

  res.json({
    address,
    authoredPapers: authoredPapers || [],
    purchases: purchases || [],
    onChain,
    stats: {
      papersAuthored: (authoredPapers || []).length,
      papersPurchased: (purchases || []).length,
      nftsMinted: onChain.nfts.length,
      totalAnchors: onChain.anchors.length,
    },
  });
}

module.exports = { getProfile };
