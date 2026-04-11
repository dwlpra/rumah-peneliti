require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const { stmts, parseArticle } = require("./db");

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

// Upload paper
app.post("/api/papers", upload.single("file"), async (req, res) => {
  try {
    const { title, authors, abstract, price_wei, author_wallet } = req.body;
    if (!title) return res.status(400).json({ error: "title is required" });
    const filePath = req.file ? req.file.path : "";
    const result = stmts.insertPaper.run(title, authors || "", abstract || "", filePath, price_wei || "0", author_wallet || "");
    const paper = stmts.getPaper.get(result.lastInsertRowid);
    res.json({ success: true, paper });
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

const { db } = require("./db");
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`RumahPeneliti API running on port ${PORT}`);
});
