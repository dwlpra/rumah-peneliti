/**
 * On-Chain Sync Service
 *
 * Keeps local DB in sync with blockchain data.
 * On-chain is the source of truth. DB is cache + rich content.
 *
 * Runs on every backend startup. Like Ponder re-indexing.
 *
 * 3 scenarios:
 *   1. Paper on-chain, not in DB        → insert paper + AI curate
 *   2. Paper on-chain, in DB, no article → AI curate
 *   3. Paper in DB, not on-chain         → delete orphan
 */

const { ethers } = require("ethers");
const { db, stmts, generateSlug } = require("../db");
const { generateArticle } = require("./kurasi");

// ── Config ──
function getRpcUrl() { return process.env.RPC_URL || "https://evmrpc.0g.ai"; }
function getAnchorAddress() { return process.env.PAPER_ANCHOR_ADDRESS || "0x335C0b922325dd5214Bb9e7CDcA6a61A24B0d8C7"; }
function getJournalAddress() { return process.env.CONTRACT_ADDRESS || "0xc6FD8fa40ED06D21FDCA1961B75a7170991422D0"; }
function getNftAddress() { return process.env.NFT_CONTRACT_ADDRESS || "0x010a70be3D661B98f69Ab4De1e213CA56C90de4a"; }

const ANCHOR_ABI = [
  "function nextId() view returns (uint256)",
  "function getPaper(uint256 paperId) view returns (tuple(uint256 id, bytes32 storageRoot, bytes32 curationHash, bytes32 metadataHash, address author, uint256 timestamp, bool hasArticle, uint256 citationCount))",
];

const JOURNAL_ABI = [
  "function paperCount() view returns (uint256)",
  "function getPaper(uint256 _paperId) view returns (address author, string title, string paperHash, uint256 price, string articleHash, bool hasArticle)",
  "function uploadPaper(address _author, string calldata _title, string calldata _paperHash, uint256 _price) external returns (uint256)",
];

const NFT_ABI = [
  "function totalSupply() view returns (uint256)",
  "function getResearchToken(uint256 tokenId) external view returns (tuple(uint256 tokenId, uint256 paperId, bytes32 storageRoot, bytes32 curationHash, string metadataURI, address researcher, uint256 mintedAt))",
];

// ── On-chain readers ──

function getProvider() {
  return new ethers.JsonRpcProvider(getRpcUrl());
}

async function readAnchorPapers() {
  const contract = new ethers.Contract(getAnchorAddress(), ANCHOR_ABI, getProvider());
  const nextId = await contract.nextId();
  const papers = [];
  for (let i = 1; i <= Number(nextId); i++) {
    try {
      const p = await contract.getPaper(i);
      papers.push({
        id: Number(p.id),
        storageRoot: p.storageRoot,
        curationHash: p.curationHash,
        metadataHash: p.metadataHash,
        author: p.author,
        timestamp: Number(p.timestamp),
        hasArticle: p.hasArticle,
      });
    } catch (e) {
      console.warn(`[Sync] Anchor paper #${i} read failed:`, e.message);
    }
  }
  return papers;
}

async function readJournalPapers() {
  const contract = new ethers.Contract(getJournalAddress(), JOURNAL_ABI, getProvider());
  const count = await contract.paperCount();
  const papers = [];
  for (let i = 1; i <= Number(count); i++) {
    try {
      const p = await contract.getPaper(i);
      papers.push({
        id: i,
        author: p.author,
        title: p.title,
        paperHash: p.paperHash,
        price: p.price.toString(),
        hasArticle: p.hasArticle,
      });
    } catch (e) {
      console.warn(`[Sync] Journal paper #${i} read failed:`, e.message);
    }
  }
  return papers;
}

async function readNFTs() {
  const contract = new ethers.Contract(getNftAddress(), NFT_ABI, getProvider());
  const supply = await contract.totalSupply();
  const nfts = [];
  for (let i = 1; i <= Number(supply); i++) {
    try {
      const t = await contract.getResearchToken(i);
      nfts.push({
        tokenId: Number(t.tokenId),
        paperId: Number(t.paperId),
        storageRoot: t.storageRoot,
        researcher: t.researcher,
      });
    } catch (e) {
      console.warn(`[Sync] NFT #${i} read failed:`, e.message);
    }
  }
  return nfts;
}

// ── AI Curation for synced paper ──

async function curatePaper(paperId, title, abstract) {
  try {
    const article = await generateArticle(paperId, title, abstract || "", "");
    const meta = article.meta || article.agent_meta || {};
    const agentTokenId = meta.agent_token_id || 0; // AgenticID token 0 = Kurator
    const agentIdentityContract = meta.agent_identity_contract || process.env.AGENTIC_ID_ADDRESS || null;

    stmts.insertArticle.run(
      paperId,
      article.curated_title,
      article.summary,
      JSON.stringify(article.key_takeaways),
      article.body,
      JSON.stringify(article.tags),
      article.mock ? 1 : 0,
      article.ai_score ? JSON.stringify(article.ai_score) : null,
      article.classification ? JSON.stringify(article.classification) : null,
      article.agent_meta ? JSON.stringify(article.agent_meta) : null,
      agentTokenId,
      agentIdentityContract,
    );
    console.log(`[Sync] AI curated paper #${paperId} (${article.mock ? "mock" : "AI"})`);
  } catch (e) {
    console.warn(`[Sync] AI curation failed for paper #${paperId}:`, e.message);
  }
}

// ── Main sync ──

async function syncChain() {
  console.log("[Sync] Starting on-chain sync...");

  try {
    // 1. Read all on-chain data
    const [anchorPapers, journalPapers, nfts] = await Promise.all([
      readAnchorPapers(),
      readJournalPapers(),
      readNFTs(),
    ]);

    console.log(`[Sync] On-chain: ${anchorPapers.length} anchors, ${journalPapers.length} journal, ${nfts.length} NFTs`);

    // Build lookup maps
    const journalByHash = new Map();
    for (const jp of journalPapers) {
      if (jp.paperHash) journalByHash.set(jp.paperHash.toLowerCase(), jp);
    }
    const nftByPaperId = new Map();
    for (const n of nfts) {
      nftByPaperId.set(n.paperId, n);
    }

    // 2. Build set of on-chain paper IDs (using anchor IDs as source of truth)
    const onChainIds = new Set(anchorPapers.map(p => p.id));

    // 3. Read DB state
    const dbPapers = stmts.listPapers.all();
    const dbPaperByStorageHash = new Map();
    const dbPaperByAnchorId = new Map();
    for (const p of dbPapers) {
      if (p.storage_hash) dbPaperByStorageHash.set(p.storage_hash.toLowerCase(), p);
    }
    console.log(`[Sync] DB: ${dbPapers.length} papers`);

    // 4. Scenario 1 & 2: On-chain papers
    let inserted = 0;
    let curated = 0;

    for (const anchor of anchorPapers) {
      // Try to find matching DB paper by storage hash
      let dbPaper = dbPaperByStorageHash.get(anchor.storageRoot.toLowerCase()) || null;

      // Also try matching by journal data
      if (!dbPaper) {
        const jp = journalByHash.get(anchor.storageRoot.toLowerCase());
        if (jp) {
          // Check if there's a DB paper with this title from journal
          const existing = db.prepare("SELECT * FROM papers WHERE title = ?").get(jp.title);
          if (existing) dbPaper = existing;
        }
      }

      if (!dbPaper) {
        // Scenario 1: Paper on-chain but not in DB — insert
        // NOTE: On-chain `author` is msg.sender (usually backend/deployer wallet),
        // NOT the real paper author. We store it as author_wallet for reference
        // but it may not reflect the actual author identity.
        const jp = journalByHash.get(anchor.storageRoot.toLowerCase());
        const title = jp?.title || `Paper #${anchor.id}`;
        // Best author source: NFT researcher > journal author > anchor author
        const nftForAuthor = nftByPaperId.get(anchor.id);
        const onChainAuthor = nftForAuthor?.researcher || jp?.author || anchor.author;
        const price = jp?.price || "0";

        const result = db.prepare(
          "INSERT INTO papers (title, authors, abstract, file_path, storage_hash, price_wei, author_wallet, pipeline_status, anchor_tx_hash, journal_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        ).run(
          title,
          onChainAuthor,
          "",
          "",
          anchor.storageRoot,
          price,
          onChainAuthor,
          anchor.hasArticle ? "complete" : "anchored",
          "synced-from-chain",
          journalPapers.find(j => j.paperHash?.toLowerCase() === anchor.storageRoot.toLowerCase())?.id || null,
        );

        const paperId = result.lastInsertRowid;
        const slug = generateSlug(title, paperId);
        db.prepare("UPDATE papers SET slug = ? WHERE id = ?").run(slug, paperId);

        // Attach NFT info if exists
        const nft = nftByPaperId.get(anchor.id);
        if (nft) {
          db.prepare("UPDATE papers SET nft_token_id = ?, nft_tx_hash = ? WHERE id = ?")
            .run(nft.tokenId, "synced-from-chain", paperId);
        }

        inserted++;
        console.log(`[Sync] Inserted paper #${paperId} "${title}" from on-chain`);

        // Check if article exists
        const article = stmts.getArticle.get(paperId);
        if (!article) {
          await curatePaper(paperId, title, "");
          curated++;
        }
      } else {
        // Paper exists in DB — check if article is missing
        const article = stmts.getArticle.get(dbPaper.id);
        if (!article) {
          // Scenario 2: Paper in DB but no article — curate
          console.log(`[Sync] Paper #${dbPaper.id} has no article, curating...`);
          await curatePaper(dbPaper.id, dbPaper.title, dbPaper.abstract);
          curated++;
        }

        // Update pipeline status if needed
        if (dbPaper.pipeline_status === "pending" && anchor.hasArticle) {
          db.prepare("UPDATE papers SET pipeline_status = 'complete' WHERE id = ?").run(dbPaper.id);
        }

        // Backfill anchor tx hash if missing
        if (!dbPaper.anchor_tx_hash) {
          db.prepare("UPDATE papers SET anchor_tx_hash = ? WHERE id = ?").run("synced-from-chain", dbPaper.id);
        }

        // Backfill author from NFT researcher if it's a wallet address
        const nftAuthor = nftByPaperId.get(anchor.id);
        if (nftAuthor?.researcher && dbPaper.authors?.startsWith("0x")) {
          db.prepare("UPDATE papers SET authors = ?, author_wallet = ? WHERE id = ?")
            .run(nftAuthor.researcher, nftAuthor.researcher, dbPaper.id);
        }

        // Backfill journal_id if missing
        if (!dbPaper.journal_id) {
          const jp = journalByHash.get(anchor.storageRoot.toLowerCase());
          if (jp) {
            db.prepare("UPDATE papers SET journal_id = ? WHERE id = ?").run(jp.id, dbPaper.id);
          }
        }

        // Backfill NFT if missing
        if (!dbPaper.nft_token_id) {
          const nft = nftByPaperId.get(anchor.id);
          if (nft) {
            db.prepare("UPDATE papers SET nft_token_id = ?, nft_tx_hash = ? WHERE id = ?")
              .run(nft.tokenId, "synced-from-chain", dbPaper.id);
          }
        }
      }
    }

    // 5. Scenario 3: DB papers not on-chain — delete orphans
    let deleted = 0;
    for (const dbPaper of dbPapers) {
      // Only delete papers that have been through the pipeline (have storage_hash)
      if (!dbPaper.storage_hash) continue;
      // Check if this storage hash exists on-chain
      const hash = dbPaper.storage_hash.toLowerCase();
      const foundOnChain = anchorPapers.some(a => a.storageRoot.toLowerCase() === hash);
      if (!foundOnChain) {
        console.log(`[Sync] Deleting orphan paper #${dbPaper.id} "${dbPaper.title}" (not on-chain)`);
        stmts.deletePaper.run(dbPaper.id);
        deleted++;
      }
    }

    console.log(`[Sync] Complete: ${inserted} inserted, ${curated} curated, ${deleted} deleted`);

    // 6. Backfill real txHash from Ponder indexer
    await backfillTxHashesFromPonder();

  } catch (e) {
    console.warn("[Sync] Failed:", e.message);
  }
}

/**
 * Query Ponder indexer for real txHashes and update DB records
 * that have placeholder "synced-from-chain" values.
 */
async function backfillTxHashesFromPonder() {
  const ponderUrl = process.env.PONDER_URL || "http://localhost:42069";
  try {
    // Query anchor events
    const anchorRes = await fetch(`${ponderUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ paperAnchorEventss { items { paperId storageRoot txHash } } }" }),
    });
    const anchorData = await anchorRes.json();
    const anchorEvents = anchorData?.data?.paperAnchorEventss?.items || [];

    // Query NFT events
    const nftRes = await fetch(`${ponderUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: "{ researchNFTEventss { items { tokenId paperId txHash } } }" }),
    });
    const nftData = await nftRes.json();
    const nftEvents = nftData?.data?.researchNFTEventss?.items || [];

    let anchorUpdated = 0;
    let nftUpdated = 0;

    // Build maps: storageHash → txHash (for anchors)
    const anchorTxByHash = new Map();
    for (const e of anchorEvents) {
      if (e.storageRoot && e.txHash) {
        anchorTxByHash.set(e.storageRoot.toLowerCase(), e.txHash);
      }
    }
    // Build maps: paperId → txHash (for NFTs)
    const nftTxByPaperId = new Map();
    for (const e of nftEvents) {
      if (e.paperId && e.txHash) {
        nftTxByPaperId.set(e.paperId, e.txHash);
      }
    }

    // Update DB papers with placeholder txHash
    const papers = db.prepare("SELECT id, storage_hash, anchor_tx_hash, nft_tx_hash FROM papers WHERE anchor_tx_hash = 'synced-from-chain' OR nft_tx_hash = 'synced-from-chain'").all();
    for (const p of papers) {
      // Anchor txHash
      if (p.anchor_tx_hash === "synced-from-chain" && p.storage_hash) {
        const txHash = anchorTxByHash.get(p.storage_hash.toLowerCase());
        if (txHash) {
          db.prepare("UPDATE papers SET anchor_tx_hash = ? WHERE id = ?").run(txHash, p.id);
          anchorUpdated++;
        }
      }
      // NFT txHash
      if (p.nft_tx_hash === "synced-from-chain") {
        // Try matching by anchor paperId (on-chain ID)
        // We need to find the on-chain paperId for this DB paper
        if (p.storage_hash) {
          const anchorEvent = anchorEvents.find(e => e.storageRoot?.toLowerCase() === p.storage_hash.toLowerCase());
          if (anchorEvent) {
            const txHash = nftTxByPaperId.get(anchorEvent.paperId);
            if (txHash) {
              db.prepare("UPDATE papers SET nft_tx_hash = ? WHERE id = ?").run(txHash, p.id);
              nftUpdated++;
            }
          }
        }
      }
    }

    if (anchorUpdated > 0 || nftUpdated > 0) {
      console.log(`[Sync] TxHash backfill: ${anchorUpdated} anchors, ${nftUpdated} NFTs updated from Ponder`);
    }
  } catch (e) {
    console.warn("[Sync] TxHash backfill skipped (Ponder not ready):", e.message);
  }
}

module.exports = { syncChain };
