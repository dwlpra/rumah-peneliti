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

        // Step 5: Anchor article hash on-chain
        if (anchorResult?.paperId && !article.mock) {
          anchorArticle(anchorResult.paperId, article.body).catch(e =>
            console.warn("[Pipeline] Article anchor failed:", e.message)
          );
        }

        // Step 6: Mint research NFT (gasless)
        if (anchorResult?.paperId && !article.mock) {
          mintResearchNFT(
            author_wallet || "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55",
            Number(anchorResult.paperId),
            storageHash,
            article.body,
            { title, authors, abstract }
          ).then(nftResult => {
            console.log("[Pipeline] NFT minted:", nftResult.tokenId);
          }).catch(e => {
            console.warn("[Pipeline] NFT minting failed:", e.message);
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
