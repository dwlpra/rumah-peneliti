/**
 * Ponder Indexer Client
 *
 * Ponder adalah indexer blockchain yang membaca event dari smart contract.
 * Kita query via GraphQL untuk mendapatkan data on-chain.
 *
 * Data yang bisa diambil:
 *   - Paper Anchor events (paper yang sudah di-anchor)
 *   - Article Anchor events (artikel AI yang sudah di-anchor)
 *   - NFT Mint events (NFT yang sudah dicetak)
 *   - Payment events (pembelian paper)
 */

const PONDER_URL = process.env.PONDER_URL || "http://localhost:42069";

/**
 * Query Ponder GraphQL API
 *
 * @param {string} query - GraphQL query string
 * @returns {Promise<object>} - Parsed JSON response
 *
 * @example
 *   const data = await queryPonder(`{
 *     paperAnchorEventss {
 *       items { paperId storageRoot author txHash }
 *     }
 *   }`);
 */
async function queryPonder(query) {
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

/**
 * Ambil semua on-chain events untuk paper tertentu
 *
 * Mengambil 3 jenis event secara paralel:
 *   - Anchor (paper sudah di-anchor ke blockchain?)
 *   - NFT (NFT sudah dicetak?)
 *   - Article Anchors (artikel AI sudah di-anchor?)
 *
 * @param {number} paperId - On-chain paper ID
 * @returns {Promise<{anchor, nft, articleAnchors, explorerBase}>}
 */
async function getPaperOnChainData(paperId) {
  const [anchorRes, nftRes, articleRes] = await Promise.all([
    queryPonder(`{
      paperAnchorEventss {
        items { paperId storageRoot curationHash metadataHash author txHash blockNumber timestamp }
      }
    }`),
    queryPonder(`{
      researchNFTEventss {
        items { tokenId paperId researcher txHash blockNumber }
      }
    }`),
    queryPonder(`{
      articleAnchorEventss {
        items { paperId articleHash txHash blockNumber }
      }
    }`),
  ]);

  // Filter hanya event yang cocok dengan paper ID ini
  const anchors = (anchorRes?.data?.paperAnchorEventss?.items || [])
    .filter(e => e.paperId === paperId);

  const nfts = (nftRes?.data?.researchNFTEventss?.items || [])
    .filter(e => e.paperId === paperId);

  const articleAnchors = (articleRes?.data?.articleAnchorEventss?.items || [])
    .filter(e => e.paperId === paperId);

  return {
    anchor: anchors[0] || null,
    nft: nfts[0] || null,
    articleAnchors,
    explorerBase: "https://chainscan.0g.ai",
  };
}

/**
 * Ambil activity feed (event terbaru)
 *
 * @param {number} limit - Maksimal jumlah event
 * @returns {Promise<{activity, stats}>}
 */
async function getActivityFeed(limit = 20) {
  const [anchorRes, nftRes] = await Promise.all([
    queryPonder(`{
      paperAnchorEventss {
        items { paperId author txHash timestamp blockNumber }
        totalCount
      }
    }`),
    queryPonder(`{
      researchNFTEventss {
        items { tokenId paperId researcher txHash timestamp blockNumber }
        totalCount
      }
    }`),
  ]);

  const anchors = (anchorRes?.data?.paperAnchorEventss?.items || [])
    .map(e => ({ ...e, type: "anchor" }));

  const nfts = (nftRes?.data?.researchNFTEventss?.items || [])
    .map(e => ({ ...e, type: "nft" }));

  // Gabungkan dan urutkan dari terbaru
  const activity = [...anchors, ...nfts]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit);

  return {
    activity,
    stats: {
      anchors: anchorRes?.data?.paperAnchorEventss?.totalCount || 0,
      nfts: nftRes?.data?.researchNFTEventss?.totalCount || 0,
    },
  };
}

/**
 * Ambil on-chain events milik wallet address tertentu
 *
 * @param {string} address - Wallet address (lowercase)
 * @returns {Promise<{anchors, nfts, payments}>}
 */
async function getWalletEvents(address) {
  const [anchorRes, nftRes, paymentRes] = await Promise.all([
    queryPonder(`{
      paperAnchorEventss {
        items { paperId storageRoot author txHash blockNumber timestamp }
      }
    }`),
    queryPonder(`{
      researchNFTEventss {
        items { tokenId paperId researcher txHash blockNumber timestamp }
      }
    }`),
    queryPonder(`{
      paymentEventss {
        items { paperId buyer amount txHash blockNumber timestamp }
      }
    }`),
  ]);

  const addr = address.toLowerCase();

  return {
    anchors: (anchorRes?.data?.paperAnchorEventss?.items || [])
      .filter(a => a.author?.toLowerCase() === addr),
    nfts: (nftRes?.data?.researchNFTEventss?.items || [])
      .filter(n => n.researcher?.toLowerCase() === addr),
    payments: (paymentRes?.data?.paymentEventss?.items || [])
      .filter(p => p.buyer?.toLowerCase() === addr),
  };
}

/**
 * Verifikasi apakah hash ada di on-chain events
 *
 * Cek di: Paper Anchor, Article Anchor, dan NFT events.
 *
 * @param {string} hash - Hash yang mau diverifikasi
 * @returns {Promise<{verified, type, data}>}
 */
async function verifyHash(hash) {
  const hashLower = hash.toLowerCase();
  const result = { hash, verified: false, type: null, data: null };

  // Cek Paper Anchor
  try {
    const res = await queryPonder(`{
      paperAnchorEventss {
        items { paperId storageRoot curationHash metadataHash author txHash blockNumber timestamp }
      }
    }`);
    const items = res?.data?.paperAnchorEventss?.items || [];
    const match = items.find(a =>
      a.storageRoot?.toLowerCase() === hashLower ||
      a.curationHash?.toLowerCase() === hashLower ||
      a.metadataHash?.toLowerCase() === hashLower
    );
    if (match) {
      return { ...result, verified: true, type: "paper_anchor", data: match };
    }
  } catch (_) {}

  // Cek Article Anchor
  try {
    const res = await queryPonder(`{
      articleAnchorEventss {
        items { paperId articleHash txHash blockNumber timestamp }
      }
    }`);
    const items = res?.data?.articleAnchorEventss?.items || [];
    const match = items.find(a => a.articleHash?.toLowerCase() === hashLower);
    if (match) {
      return { ...result, verified: true, type: "article_anchor", data: match };
    }
  } catch (_) {}

  // Cek NFT
  try {
    const res = await queryPonder(`{
      researchNFTEventss {
        items { tokenId paperId storageRoot researcher txHash blockNumber timestamp }
      }
    }`);
    const items = res?.data?.researchNFTEventss?.items || [];
    const match = items.find(n => n.storageRoot?.toLowerCase() === hashLower);
    if (match) {
      return { ...result, verified: true, type: "research_nft", data: match };
    }
  } catch (_) {}

  return result;
}

module.exports = {
  queryPonder,
  getPaperOnChainData,
  getActivityFeed,
  getWalletEvents,
  verifyHash,
};
