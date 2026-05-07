/**
 * Profile Controller
 *
 * Business logic untuk halaman profil user:
 *   - Paper yang ditulis
 *   - Paper yang dibeli
 *   - NFTs dari smart contract (bypass Ponder)
 *   - Earnings dari purchases
 */

const { db } = require("../db");
const { getAllNFTs } = require("../services/nft");

/** Get profile data berdasarkan wallet address */
async function getProfile(req, res) {
  const address = req.params.address.toLowerCase();

  // 1) Papers authored by this wallet
  const authoredPapers = db.prepare(
    "SELECT p.*, a.curated_title, a.summary " +
    "FROM papers p LEFT JOIN articles a ON p.id = a.paper_id " +
    "WHERE LOWER(p.author_wallet) = ? ORDER BY p.upload_date DESC"
  ).all(address);

  // 2) Papers purchased by this wallet
  const purchases = db.prepare(
    "SELECT pr.*, p.title as paper_title, a.curated_title " +
    "FROM purchases pr " +
    "LEFT JOIN papers p ON pr.paper_id = p.id " +
    "LEFT JOIN articles a ON pr.paper_id = a.paper_id " +
    "WHERE LOWER(pr.buyer_wallet) = ? ORDER BY pr.purchase_date DESC"
  ).all(address);

  // 3) Count curated articles for this author's papers
  const articlesCurated = db.prepare(
    "SELECT COUNT(*) as count FROM articles a " +
    "INNER JOIN papers p ON a.paper_id = p.id " +
    "WHERE LOWER(p.author_wallet) = ?"
  ).get(address).count;

  // 4) NFTs — query smart contract directly (bypass Ponder)
  let nfts = [];
  let activity = [];
  try {
    const allNfts = await getAllNFTs();
    nfts = allNfts.filter(nft => nft.researcher.toLowerCase() === address);

    // Build activity list from authored papers + NFTs
    activity = authoredPapers.map(paper => {
      const nft = nfts.find(n => Number(n.paperId) === paper.id || Number(n.paperId) === paper.journal_id);
      return {
        type: nft ? "nft" : "paper",
        paperId: paper.id,
        title: paper.curated_title || paper.title,
        slug: paper.slug,
        nftTokenId: nft?.tokenId || null,
        timestamp: paper.upload_date,
      };
    });
  } catch (e) {
    console.error("[Profile] NFT query failed:", e.message);
    // Fallback: activity from papers only
    activity = authoredPapers.map(paper => ({
      type: "paper",
      paperId: paper.id,
      title: paper.curated_title || paper.title,
      slug: paper.slug,
      nftTokenId: null,
      timestamp: paper.upload_date,
    }));
  }

  res.json({
    address,
    authoredPapers: authoredPapers || [],
    purchases: purchases || [],
    nfts,
    activity,
    stats: {
      papersUploaded: (authoredPapers || []).length,
      articlesCurated,
      nftsEarned: nfts.length,
    },
  });
}

module.exports = { getProfile };
