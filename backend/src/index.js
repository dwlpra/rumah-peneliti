require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { stmts, parseArticle, parseArticles } = require("./db");
const { generateArticle } = require("./services/kurasi");
const { uploadTo0G } = require("./services/storage");
const { anchorPaper, anchorArticle } = require("./services/anchor");
const { publishDAProof } = require("./services/da-layer");
const { mintResearchNFT, getNFTByPaper, getTotalSupply } = require("./services/nft");

const app = express();
app.use(cors());
app.use(express.json());

// Static files for uploads
const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

// Multer
const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// ============ PAPER ROUTES ============

// Upload paper (full pipeline: 0G Storage → DA → Anchor → AI Curation)
app.post("/api/papers", upload.single("file"), async (req, res) => {
  try {
    // Pre-flight: check wallet balance for gas sponsorship
    try {
      const { ethers } = await import("ethers");
      const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://evmrpc-testnet.0g.ai");
      const bal = await provider.getBalance("0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55");
      if (Number(ethers.formatEther(bal)) < 0.005) {
        console.warn("[Pipeline] Wallet balance low:", ethers.formatEther(bal), "0G");
      }
    } catch (_) {}

    const { title, authors, abstract, price_wei, author_wallet } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });

    const filePath = req.file ? req.file.path : "";

    // Step 1: Upload to 0G Storage
    let storageHash = "";
    if (req.file) {
      try {
        const result0g = await uploadTo0G(req.file.path);
        storageHash = result0g.rootHash;
        console.log("[Pipeline] 0G Storage hash:", storageHash);
      } catch (e) {
        console.warn("[Pipeline] 0G Storage upload failed:", e.message);
      }
    }

    // Step 2: Publish DA proof
    let daProof = null;
    if (storageHash) {
      try {
        const metadataHash = JSON.stringify({ title, authors, abstract });
        daProof = await publishDAProof(storageHash, metadataHash);
        console.log("[Pipeline] DA proof:", daProof.blobHash);
      } catch (e) {
        console.warn("[Pipeline] DA publish failed:", e.message);
      }
    }

    // Step 3: Anchor on-chain
    let anchorResult = null;
    if (storageHash) {
      try {
        anchorResult = await anchorPaper(storageHash, title, authors || "", abstract || "");
        console.log("[Pipeline] Anchored on-chain. ID:", anchorResult.paperId);
      } catch (e) {
        console.warn("[Pipeline] Chain anchor failed:", e.message);
      }
    }

    // Save to DB
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

    // Step 4: AI Curation (0G Compute → GLM → Mock)
    const textContent = req.file
      ? fs.readFileSync(req.file.path, "utf-8").slice(0, 50000)
      : abstract || "";
    generateArticle(paperId, title, abstract, textContent)
      .then((article) => {
        stmts.insertArticle.run(
          paperId,
          article.curated_title,
          article.summary,
          JSON.stringify(article.key_takeaways),
          article.body,
          JSON.stringify(article.tags),
          article.mock ? 1 : 0
        );
        console.log("[Pipeline] Article generated for paper:", paperId, article.mock ? "(mock)" : "(AI)");

        // Step 5 & 6: Anchor article then mint NFT (sequential to avoid nonce conflict)
        if (anchorResult?.paperId) {
          anchorArticle(anchorResult.paperId, article.body)
            .then(() => {
              console.log("[Pipeline] Article anchored, minting NFT...");
              return mintResearchNFT(
                author_wallet || "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55",
                Number(anchorResult.paperId),
                storageHash,
                article.body,
                { title, authors, abstract }
              );
            })
            .then(nftResult => {
              console.log("[Pipeline] NFT minted:", nftResult.tokenId);
            })
            .catch(e => {
              console.warn("[Pipeline] Anchor/NFT failed:", e.message);
            });
        }
      })
      .catch((e) => console.warn("[Pipeline] AI curation failed:", e.message));

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// List papers
app.get("/api/papers", (req, res) => {
  const papers = stmts.listPapers.all();
  res.json(papers);
});

// Get single paper + article
app.get("/api/papers/:id", (req, res) => {
  const paper = stmts.getPaper.get(req.params.id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });
  const article = parseArticle(stmts.getArticle.get(req.params.id));
  res.json({ ...paper, article });
});

// Purchase paper
app.post("/api/papers/:id/purchase", async (req, res) => {
  try {
    const { buyer_wallet, tx_hash, amount } = req.body;
    const paper = stmts.getPaper.get(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    if (!buyer_wallet) return res.status(400).json({ error: "buyer_wallet required" });

    stmts.insertPurchase.run(req.params.id, buyer_wallet, tx_hash || "", amount || paper.price_wei);
    res.json({ success: true, message: "Purchase recorded" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check access
app.get("/api/papers/:id/access/:wallet", (req, res) => {
  const purchase = stmts.getPurchase.get(req.params.id, req.params.wallet);
  res.json({ hasAccess: !!purchase });
});

// ============ ARTICLE ROUTES ============

app.get("/api/articles", (req, res) => {
  const articles = parseArticles(stmts.listArticles.all());
  res.json(articles);
});

app.get("/api/articles/:id", (req, res) => {
  let article = stmts.getArticle.get(req.params.id);
  if (!article) article = stmts.getArticleById.get(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });
  const paper = stmts.getPaper.get(article.paper_id);
  res.json({ ...parseArticle(article), paper });
});

// ============ PIPELINE STATUS ============

// Mint NFT for existing paper
app.post("/api/papers/:id/mint", async (req, res) => {
  try {
    const paper = stmts.getPaper.get(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    if (!paper.storage_hash) return res.status(400).json({ error: "Paper not stored on 0G" });

    const article = parseArticle(stmts.getArticle.get(req.params.id));
    if (!article) return res.status(400).json({ error: "No curated article yet" });

    const { recipient } = req.body;
    const to = recipient || paper.author_wallet || "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55";

    const result = await mintResearchNFT(to, Number(req.params.id), paper.storage_hash, article.body, {
      title: paper.title, authors: paper.authors, abstract: paper.abstract,
    });

    res.json({ success: true, nft: result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get NFT info for paper
app.get("/api/papers/:id/nft", async (req, res) => {
  try {
    const nft = await getNFTByPaper(Number(req.params.id));
    res.json(nft);
  } catch (err) {
    res.status(404).json({ error: err.message });
  }
});

// NFT stats
app.get("/api/nfts/stats", async (req, res) => {
  try {
    const total = await getTotalSupply();
    res.json({ totalSupply: total, contract: process.env.NFT_CONTRACT_ADDRESS });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ PIPELINE STATUS ============

app.get("/api/pipeline/status", (req, res) => {
  res.json({
    storage: { configured: !!process.env.RPC_URL, indexer: "https://indexer-storage-testnet-turbo.0g.ai" },
    da: { configured: true, endpoint: "https://da-testnet.0g.ai" },
    anchor: { configured: true, contract: process.env.PAPER_ANCHOR_ADDRESS || "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE" },
    compute: { configured: !!process.env.PRIVATE_KEY, provider: "0G Compute Network" },
    chain: { rpc: process.env.RPC_URL, chainId: 16602, explorer: "https://chainscan-galileo.0g.ai" },
  });
});

// ============ INDEXER (Ponder GraphQL Proxy) ============

const PONDER_URL = process.env.PONDER_URL || "http://localhost:42069";

async function queryPonder(query) {
  const res = await fetch(`${PONDER_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

// Get on-chain data for a specific paper
app.get("/api/papers/:id/onchain", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const [anchorRes, nftRes, articleRes] = await Promise.all([
      queryPonder(`{ paperAnchorEventss { items { paperId storageRoot curationHash metadataHash author txHash blockNumber timestamp } } }`),
      queryPonder(`{ researchNFTEventss { items { tokenId paperId researcher txHash blockNumber } } }`),
      queryPonder(`{ articleAnchorEventss { items { paperId articleHash txHash blockNumber } } }`),
    ]);

    const anchors = (anchorRes?.data?.paperAnchorEventss?.items || []).filter(e => e.paperId === paperId);
    const nfts = (nftRes?.data?.researchNFTEventss?.items || []).filter(e => e.paperId === paperId);
    const articles = (articleRes?.data?.articleAnchorEventss?.items || []).filter(e => e.paperId === paperId);

    res.json({
      paperId,
      anchor: anchors[0] || null,
      nft: nfts[0] || null,
      articleAnchors: articles,
      explorerBase: "https://chainscan-galileo.0g.ai",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Activity feed
app.get("/api/activity", async (req, res) => {
  try {
    const [anchorRes, nftRes] = await Promise.all([
      queryPonder(`{ paperAnchorEventss { items { paperId author txHash timestamp blockNumber } totalCount } }`),
      queryPonder(`{ researchNFTEventss { items { tokenId paperId researcher txHash timestamp blockNumber } totalCount } }`),
    ]);

    const anchors = (anchorRes?.data?.paperAnchorEventss?.items || []).map(e => ({ ...e, type: "anchor" }));
    const nfts = (nftRes?.data?.researchNFTEventss?.items || []).map(e => ({ ...e, type: "nft" }));

    const activity = [...anchors, ...nfts]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 20);

    res.json({
      activity,
      stats: {
        anchors: anchorRes?.data?.paperAnchorEventss?.totalCount || 0,
        nfts: nftRes?.data?.researchNFTEventss?.totalCount || 0,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health
app.get("/api/health", (req, res) => {
  const paperCount = db.prepare("SELECT COUNT(*) as c FROM papers").get().c;
  const articleCount = db.prepare("SELECT COUNT(*) as c FROM articles").get().c;
  res.json({ status: "ok", papers: paperCount, articles: articleCount });
});

const { db } = require("./db");
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`RumahPeneliti API running on port ${PORT}`);
});

// ============ WALLET STATUS ============
app.get("/api/wallet/status", async (req, res) => {
  try {
    const { ethers } = await import("ethers");
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || "https://evmrpc-testnet.0g.ai");
    const balance = await provider.getBalance("0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55");
    const balance0G = Number(ethers.formatEther(balance));
    res.json({
      address: "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55",
      balance: balance0G.toFixed(4) + " 0G",
      balanceRaw: balance0G,
      canSponsor: balance0G > 0.01,
      network: "0G Galileo Testnet",
      chainId: 16602,
      faucet: "https://faucet.0g.ai",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ PROFILE ============
app.get("/api/profile/:address", async (req, res) => {
  try {
    const address = req.params.address.toLowerCase();
    const { stmts, db } = require("./db");

    // Papers authored by this address
    const authoredPapers = db.prepare(
      "SELECT p.*, a.curated_title, a.summary FROM papers p LEFT JOIN articles a ON p.id = a.paper_id WHERE LOWER(p.author_wallet) = ? ORDER BY p.upload_date DESC"
    ).all(address);

    // Papers purchased by this address
    const purchases = db.prepare(
      "SELECT pr.*, p.title as paper_title, a.curated_title FROM purchases pr LEFT JOIN papers p ON pr.paper_id = p.id LEFT JOIN articles a ON pr.paper_id = a.paper_id WHERE LOWER(pr.buyer_wallet) = ? ORDER BY pr.purchase_date DESC"
    ).all(address);

    // Get on-chain data from indexer
    let onChainData = { anchors: [], nfts: [], payments: [] };
    try {
      const [anchorRes, nftRes, paymentRes] = await Promise.all([
        queryPonder(`{ paperAnchorEventss { items { paperId storageRoot author txHash blockNumber timestamp } } }`),
        queryPonder(`{ researchNFTEventss { items { tokenId paperId researcher txHash blockNumber timestamp } } }`),
        queryPonder(`{ paymentEventss { items { paperId buyer amount txHash blockNumber timestamp } } }`),
      ]);
      const allAnchors = anchorRes?.data?.paperAnchorEventss?.items || [];
      const allNfts = nftRes?.data?.researchNFTEventss?.items || [];
      const allPayments = paymentRes?.data?.paymentEventss?.items || [];

      onChainData.anchors = allAnchors.filter(a => a.author?.toLowerCase() === address);
      onChainData.nfts = allNfts.filter(n => n.researcher?.toLowerCase() === address);
      onChainData.payments = allPayments.filter(p => p.buyer?.toLowerCase() === address);
    } catch (_) {}

    res.json({
      address,
      authoredPapers: authoredPapers || [],
      purchases: purchases || [],
      onChain: onChainData,
      stats: {
        papersAuthored: (authoredPapers || []).length,
        papersPurchased: (purchases || []).length,
        nftsMinted: onChainData.nfts.length,
        totalAnchors: onChainData.anchors.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ VERIFY ============
app.get("/api/verify/:hash", async (req, res) => {
  try {
    const hash = req.params.hash;
    const result = {
      hash,
      verified: false,
      type: null,
      data: null,
    };

    // Check paper anchors
    try {
      const anchorRes = await queryPonder(`{ paperAnchorEventss { items { paperId storageRoot curationHash metadataHash author txHash blockNumber timestamp } } }`);
      const anchors = anchorRes?.data?.paperAnchorEventss?.items || [];
      const match = anchors.find(a =>
        a.storageRoot?.toLowerCase() === hash.toLowerCase() ||
        a.curationHash?.toLowerCase() === hash.toLowerCase() ||
        a.metadataHash?.toLowerCase() === hash.toLowerCase()
      );
      if (match) {
        result.verified = true;
        result.type = "paper_anchor";
        result.data = match;
      }
    } catch (_) {}

    // Check article anchors if not yet verified
    if (!result.verified) {
      try {
        const articleRes = await queryPonder(`{ articleAnchorEventss { items { paperId articleHash txHash blockNumber timestamp } } }`);
        const articles = articleRes?.data?.articleAnchorEventss?.items || [];
        const match = articles.find(a => a.articleHash?.toLowerCase() === hash.toLowerCase());
        if (match) {
          result.verified = true;
          result.type = "article_anchor";
          result.data = match;
        }
      } catch (_) {}
    }

    // Check NFTs if not yet verified
    if (!result.verified) {
      try {
        const nftRes = await queryPonder(`{ researchNFTEventss { items { tokenId paperId storageRoot researcher txHash blockNumber timestamp } } }`);
        const nfts = nftRes?.data?.researchNFTEventss?.items || [];
        const match = nfts.find(n => n.storageRoot?.toLowerCase() === hash.toLowerCase());
        if (match) {
          result.verified = true;
          result.type = "research_nft";
          result.data = match;
        }
      } catch (_) {}
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
