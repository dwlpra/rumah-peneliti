/**
 * Paper Controller
 *
 * Business logic untuk semua operasi paper:
 *   - Upload paper + jalankan pipeline 6 langkah
 *   - List papers (dengan search, filter, sort, pagination)
 *   - Get single paper
 *   - Purchase paper
 *   - Check access
 *   - Delete paper (admin)
 *   - On-chain data
 *   - Activity feed
 *   - AI Chat
 */

const fs = require("fs");
const { ethers } = require("ethers");
const { stmts, parseArticle, parseArticles, db } = require("../db");
const { generateArticle } = require("../services/kurasi");
const { uploadTo0G } = require("../services/storage");
const { anchorPaper, anchorArticle } = require("../services/anchor");
const { publishDAProof } = require("../services/da-layer");
const { mintResearchNFT } = require("../services/nft");
const { getPaperOnChainData, getActivityFeed } = require("../utils/ponder");

// ============================================================
//  UPLOAD PAPER + FULL PIPELINE
// ============================================================

/**
 * Upload paper dan jalankan pipeline 6 langkah
 *
 * Step 1-3: Synchronous (blocking) — user menunggu response
 * Step 4-6: Asynchronous (background) — user tidak menunggu
 *
 * Pipeline:
 *   1. Upload ke 0G Storage
 *   2. Publish DA Proof
 *   3. Anchor on-chain (smart contract)
 *   4. AI Curation (0G Compute / GLM)
 *   5. Article Anchor
 *   6. NFT Minting
 */
async function uploadPaper(req, res) {
  // ── Validasi input ──
  const { title, authors, abstract, price_wei } = req.body;
  const author_wallet = req.user.address;  // Ambil dari auth token (sudah diverifikasi)
  if (!title) return res.status(400).json({ error: "title is required" });
  if (!req.file) return res.status(400).json({ error: "file is required" });

  // ── Pre-flight: cek saldo wallet ──
  await checkWalletBalance();

  const filePath = req.file.path;

  // ── Step 1: Upload ke 0G Storage ──
  let storageHash = "";
  try {
    const result = await uploadTo0G(filePath);
    storageHash = result.rootHash;
    console.log("[Pipeline] ✅ Step 1 — 0G Storage:", storageHash);
  } catch (e) {
    console.warn("[Pipeline] ❌ Step 1 — 0G Storage failed:", e.message);
  }

  // ── Step 2: Publish DA Proof ──
  let daProof = null;
  if (storageHash) {
    try {
      const metadata = JSON.stringify({ title, authors, abstract });
      daProof = await publishDAProof(storageHash, metadata);
      console.log("[Pipeline] ✅ Step 2 — DA Proof:", daProof.blobHash);
    } catch (e) {
      console.warn("[Pipeline] ❌ Step 2 — DA failed:", e.message);
    }
  }

  // ── Step 3: Anchor on-chain ──
  let anchorResult = null;
  if (storageHash) {
    try {
      anchorResult = await anchorPaper(
        storageHash,
        title,
        authors || "",
        abstract || ""
      );
      console.log("[Pipeline] ✅ Step 3 — Anchor ID:", anchorResult.paperId);
    } catch (e) {
      console.warn("[Pipeline] ❌ Step 3 — Anchor failed:", e.message);
    }
  }

  // ── Simpan ke database ──
  const result = stmts.insertPaper.run(
    title,
    authors || "",
    abstract || "",
    filePath,
    storageHash,
    price_wei || "0",
    author_wallet || ""
  );
  const paperId = result.lastInsertRowid;

  // ── Step 4-6: Background processing ──
  runBackgroundPipeline({
    paperId,
    file: req.file,
    title,
    authors,
    abstract,
    author_wallet,
    storageHash,
    anchorResult,
  });

  // ── Response ke user (tanpa menunggu AI/NFT) ──
  const paper = stmts.getPaper.get(paperId);
  res.json({
    success: true,
    paper,
    pipeline: {
      storageUploaded: !!storageHash,
      daProof: daProof?.blobHash || null,
      chainAnchor: anchorResult?.txHash || null,
      chainPaperId: anchorResult?.paperId || null,
    },
  });
}

// ============================================================
//  LIST PAPERS
// ============================================================

/**
 * List papers dengan search, filter, sort, pagination
 *
 * Query params:
 *   - search: Cari di title, abstract, authors
 *   - category: Filter berdasarkan domain/tags
 *   - sort: "newest" | "oldest" | "title"
 *   - page: Nomor halaman (default: 1)
 *   - limit: Item per halaman (default: 100)
 */
function listPapers(req, res) {
  const { search, category, sort, page, limit } = req.query;

  let papers = stmts.listPapers.all();

  // Filter: pencarian teks
  if (search) {
    papers = filterBySearch(papers, search);
  }

  // Filter: kategori
  if (category) {
    papers = filterByCategory(papers, category);
  }

  // Sort
  papers = sortPapers(papers, sort);

  // Pagination
  const { items, total, currentPage, pageSize } = paginate(papers, page, limit);

  // Attach classification info
  const enriched = items.map(enrichWithClassification);

  res.json({ papers: enriched, total, page: currentPage, limit: pageSize });
}

// ============================================================
//  GET SINGLE PAPER
// ============================================================

function getPaper(req, res) {
  const paper = stmts.getPaper.get(req.params.id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });

  const article = parseArticle(stmts.getArticle.get(req.params.id));
  res.json({ ...paper, article });
}

// ============================================================
//  PURCHASE PAPER
// ============================================================

/**
 * Record pembelian paper
 *
 * User membeli akses paper berbayar via smart contract (frontend).
 * Backend mencatat pembayaran di database.
 * Pembelian duplikat ditolak.
 */
function purchasePaper(req, res) {
  const { buyer_wallet, tx_hash, amount } = req.body;

  const paper = stmts.getPaper.get(req.params.id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });
  if (!buyer_wallet) return res.status(400).json({ error: "buyer_wallet required" });

  // Cek duplikat
  const existing = stmts.getPurchase.get(req.params.id, buyer_wallet);
  if (existing) {
    return res.json({ success: true, message: "Already purchased", existing: true });
  }

  stmts.insertPurchase.run(
    req.params.id,
    buyer_wallet,
    tx_hash || "",
    amount || paper.price_wei
  );

  res.json({ success: true, message: "Purchase recorded" });
}

// ============================================================
//  CHECK ACCESS
// ============================================================

function checkAccess(req, res) {
  const purchase = stmts.getPurchase.get(req.params.id, req.params.wallet);
  res.json({ hasAccess: !!purchase });
}

// ============================================================
//  DELETE PAPER (Admin)
// ============================================================

function deletePaper(req, res) {
  const paper = stmts.getPaper.get(req.params.id);
  if (!paper) return res.status(404).json({ error: "Not found" });

  stmts.deletePaper.run(req.params.id);
  res.json({ success: true, deleted: req.params.id });
}

// ============================================================
//  ON-CHAIN DATA
// ============================================================

async function getOnChainData(req, res) {
  const paperId = parseInt(req.params.id);
  const data = await getPaperOnChainData(paperId);
  res.json({ paperId, ...data });
}

// ============================================================
//  ACTIVITY FEED
// ============================================================

async function getActivity(req, res) {
  const data = await getActivityFeed(20);
  res.json(data);
}

// ============================================================
//  AI CHAT
// ============================================================

/**
 * Chat dengan AI tentang paper tertentu
 *
 * User bertanya tentang paper dalam bahasa apapun.
 * AI menjawab berdasarkan konteks paper + artikel yang sudah dikurasi.
 */
async function chatAboutPaper(req, res) {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message is required" });

  const paper = stmts.getPaper.get(req.params.id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });

  const article = parseArticle(stmts.getArticle.get(req.params.id));

  // Bangun konteks dari paper + artikel
  const context = buildChatContext(paper, article);

  // Coba GLM API
  const reply = await callAI(context, message);
  if (reply) return res.json({ reply, source: "ai" });

  // Fallback
  res.json({
    reply: `Based on the paper "${paper.title}", I can help you understand the research. However, the AI service is currently unavailable. Please try again later.`,
    source: "fallback",
  });
}

// ============================================================
//  PRIVATE HELPERS
// ============================================================

/** Cek saldo wallet backend, warning kalau low */
async function checkWalletBalance() {
  try {
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://evmrpc.0g.ai");
    const bal = await provider.getBalance("0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55");
    if (Number(ethers.formatEther(bal)) < 0.005) {
      console.warn("[Pipeline] ⚠️ Wallet balance low:", ethers.formatEther(bal), "0G");
    }
  } catch (_) {}
}

/**
 * Jalankan Step 4-6 di background
 *
 * Step 4: AI curation → hasilkan artikel dari paper
 * Step 5: Anchor artikel ke blockchain
 * Step 6: Mint NFT sebagai bukti publikasi
 *
 * Step 5 & 6 berurutan (sequential) karena pakai wallet yang sama.
 * Kalau paralel, akan terjadi nonce conflict.
 */
function runBackgroundPipeline({ paperId, file, title, authors, abstract, author_wallet, storageHash, anchorResult }) {
  const textContent = file
    ? fs.readFileSync(file.path, "utf-8").slice(0, 50000)
    : abstract || "";

  generateArticle(paperId, title, abstract, textContent)
    .then(article => {
      // Step 4: Simpan hasil AI ke database
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
        article.agent_meta ? JSON.stringify(article.agent_meta) : null
      );
      console.log("[Pipeline] ✅ Step 4 — AI curation done:", paperId, article.mock ? "(mock)" : "(real AI)");

      // Step 5 & 6: Anchor artikel lalu mint NFT (berurutan)
      if (anchorResult?.paperId) {
        return anchorArticle(anchorResult.paperId, article.body)
          .then(() => {
            console.log("[Pipeline] ✅ Step 5 — Article anchored, minting NFT...");
            return mintResearchNFT(
              author_wallet || "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55",
              Number(anchorResult.paperId),
              storageHash,
              article.body,
              { title, authors, abstract }
            );
          })
          .then(nftResult => {
            console.log("[Pipeline] ✅ Step 6 — NFT minted:", nftResult.tokenId);
          });
      }
    })
    .catch(e => console.warn("[Pipeline] ❌ Background step failed:", e.message));
}

/** Filter papers berdasarkan teks pencarian */
function filterBySearch(papers, search) {
  const q = search.toLowerCase();
  return papers.filter(p =>
    (p.title || "").toLowerCase().includes(q) ||
    (p.abstract || "").toLowerCase().includes(q) ||
    (p.authors || "").toLowerCase().includes(q)
  );
}

/** Filter papers berdasarkan kategori (domain/tags) */
function filterByCategory(papers, category) {
  const cat = category.toLowerCase();
  return papers.filter(p => {
    try {
      const article = stmts.getArticle.get(p.id);
      if (article?.classification) {
        const cls = JSON.parse(article.classification);
        return (cls.domain || "").toLowerCase().includes(cat) ||
               (cls.field || "").toLowerCase().includes(cat);
      }
      if (article?.tags) {
        return JSON.parse(article.tags).some(t => t.toLowerCase().includes(cat));
      }
    } catch (_) {}
    return false;
  });
}

/** Sort papers */
function sortPapers(papers, sort) {
  if (sort === "oldest") return papers.slice().reverse();
  if (sort === "title") return papers.slice().sort((a, b) => (a.title || "").localeCompare(b.title || ""));
  return papers; // Default: newest (sudah DESC dari DB)
}

/** Paginate results */
function paginate(items, page, limit) {
  const currentPage = parseInt(page) || 1;
  const pageSize = parseInt(limit) || 100;
  const total = items.length;
  const sliced = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return { items: sliced, total, currentPage, pageSize };
}

/** Enrich paper dengan classification dari artikel */
function enrichWithClassification(paper) {
  try {
    const article = stmts.getArticle.get(paper.id);
    if (article?.classification) {
      return { ...paper, classification: JSON.parse(article.classification) };
    }
  } catch (_) {}
  return paper;
}

/** Bangun konteks untuk AI chat */
function buildChatContext(paper, article) {
  return [
    paper.title ? `Paper Title: ${paper.title}` : "",
    paper.authors ? `Authors: ${paper.authors}` : "",
    paper.abstract ? `Abstract: ${paper.abstract}` : "",
    article?.summary ? `AI Summary: ${article.summary}` : "",
    article?.key_takeaways?.length ? `Key Takeaways: ${article.key_takeaways.join("; ")}` : "",
    article?.body ? `Article: ${article.body.slice(0, 3000)}` : "",
  ].filter(Boolean).join("\n");
}

/** Panggil GLM API untuk chat */
async function callAI(context, message) {
  const API_KEY = process.env.LLM_API_KEY;
  const API_BASE = "https://api.z.ai/api/paas/v4";

  if (!API_KEY) return null;

  try {
    const res = await fetch(`${API_BASE}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: "glm-5.1",
        messages: [
          {
            role: "system",
            content: `You are an AI Research Assistant for RumahPeneliti. Answer based on the paper context below. Be concise and accurate. Reply in the same language the user asks in.\n\nPaper Context:\n${context}`,
          },
          { role: "user", content: message },
        ],
        temperature: 0.5,
        max_tokens: 1000,
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (_) {
    return null;
  }
}

module.exports = {
  uploadPaper,
  listPapers,
  getPaper,
  purchasePaper,
  checkAccess,
  deletePaper,
  getOnChainData,
  getActivity,
  chatAboutPaper,
};
