require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { stmts, parseArticle, parseArticles } = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
app.use("/uploads", express.static(UPLOAD_DIR));

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (req, file, cb) => cb(null, `${uuidv4()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

app.post("/api/papers", upload.single("file"), async (req, res) => {
  try {
    const { title, authors, abstract, price_wei, author_wallet } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });
    const filePath = req.file ? req.file.path : "";
    const result = stmts.insertPaper.run(title, authors || "", abstract || "", filePath, price_wei || "0", author_wallet || "");
    const paper = stmts.getPaper.get(result.lastInsertRowid);
    res.json({ success: true, paper });
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
});

app.get("/api/papers", (req, res) => { res.json(stmts.listPapers.all()); });

app.get("/api/papers/:id", (req, res) => {
  const paper = stmts.getPaper.get(req.params.id);
  if (!paper) return res.status(404).json({ error: "Paper not found" });
  const article = parseArticle(stmts.getArticle.get(req.params.id));
  res.json({ ...paper, article });
});

app.post("/api/papers/:id/purchase", async (req, res) => {
  try {
    const { buyer_wallet, tx_hash, amount } = req.body;
    const paper = stmts.getPaper.get(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    if (!buyer_wallet) return res.status(400).json({ error: "buyer_wallet required" });
    stmts.insertPurchase.run(req.params.id, buyer_wallet, tx_hash || "", amount || paper.price_wei);
    res.json({ success: true, message: "Purchase recorded" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get("/api/papers/:id/access/:wallet", (req, res) => {
  const purchase = stmts.getPurchase.get(req.params.id, req.params.wallet);
  res.json({ hasAccess: !!purchase });
});

app.get("/api/articles", (req, res) => { res.json(parseArticles(stmts.listArticles.all())); });

app.get("/api/articles/:id", (req, res) => {
  let article = stmts.getArticle.get(req.params.id);
  if (!article) article = stmts.getArticleById.get(req.params.id);
  if (!article) return res.status(404).json({ error: "Article not found" });
  const paper = stmts.getPaper.get(article.paper_id);
  res.json({ ...parseArticle(article), paper });
});

const { db } = require("./db");
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => { console.log(`RumahPeneliti API running on port ${PORT}`); });
