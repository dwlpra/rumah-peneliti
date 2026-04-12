const express = require("express");
const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");
const { uploadTo0G, downloadFrom0G } = require("../services/storage");
const { generateArticle } = require("../services/kurasi");

const ABI = [
  "function uploadPaper(string _title, string _paperHash, uint256 _price) returns (uint256)",
  "function getPaper(uint256 _paperId) view returns (address author, string title, string paperHash, uint256 price, string articleHash, bool hasArticle)",
  "function checkAccess(uint256 _paperId, address _reader) view returns (bool)",
  "function purchasePaper(uint256 _paperId) payable",
  "function setArticle(uint256 _paperId, string _articleHash)",
  "event PaperUploaded(uint256 paperId, address author, string title, string paperHash, uint256 price)",
  "event PaperPurchased(uint256 paperId, address reader, uint256 amount)",
  "event ArticleCreated(uint256 paperId, string articleHash)",
];

function getContract() {
  const rpc = process.env.ZERO_TESTNET_RPC || "https://evm-rpc.zero-testnet.xdao.ai";
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  return new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, wallet);
}

module.exports = function (upload) {
  const router = express.Router();

  // Upload paper
  router.post("/upload", upload.single("file"), async (req, res) => {
    try {
      const { title, authorAddress, price } = req.body;
      const file = req.file;
      if (!file || !title || !price) {
        return res.status(400).json({ error: "file, title, and price required" });
      }

      // Read file and upload to 0G Storage
      const fileBuffer = fs.readFileSync(file.path);
      let zgHash;
      try {
        zgHash = await uploadTo0G(fileBuffer, file.originalname);
      } catch (e) {
        console.warn("0G upload failed, using local hash:", e.message);
        zgHash = `local-${Buffer.from(fileBuffer).toString("hex").slice(0, 32)}`;
      }

      // Store locally
      const paperId = `p-${Date.now()}`;
      const paperData = {
        id: paperId,
        title,
        authorAddress: authorAddress || "unknown",
        price: ethers.parseEther(price),
        priceEth: price,
        zgHash,
        filePath: file.path,
        createdAt: new Date().toISOString(),
      };

      const papers = req.app.locals.papers;
      papers.set(paperId, paperData);

      // Try on-chain upload (optional, don't fail if no contract)
      if (process.env.CONTRACT_ADDRESS && process.env.PRIVATE_KEY) {
        try {
          const contract = getContract();
          const tx = await contract.uploadPaper(title, zgHash, ethers.parseEther(price));
          const receipt = await tx.wait();
          paperData.txHash = receipt.hash;
          console.log("On-chain paper uploaded:", receipt.hash);
        } catch (e) {
          console.warn("On-chain upload failed:", e.message);
        }
      }

      // Trigger AI curation in background
      try {
        const textContent = fileBuffer.toString("utf-8", 0, Math.min(fileBuffer.length, 50000));
        generateArticle(paperId, title, textContent).then((article) => {
          const articles = req.app.locals.articles;
          articles.set(paperId, { ...article, paperId });
          console.log("Article generated for:", paperId);
        }).catch(e => console.warn("AI curation failed:", e.message));
      } catch (e) {
        console.warn("Kurasi trigger failed:", e.message);
      }

      res.json({ success: true, paperId, zgHash });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
  });

  // List papers
  router.get("/", (req, res) => {
    const papers = Array.from(req.app.locals.papers.values());
    res.json(papers);
  });

  // Get single paper
  router.get("/:id", (req, res) => {
    const paper = req.app.locals.papers.get(req.params.id);
    if (!paper) return res.status(404).json({ error: "Paper not found" });
    res.json(paper);
  });

  // Purchase access
  router.post("/:id/purchase", async (req, res) => {
    try {
      const { readerAddress } = req.body;
      const paper = req.app.locals.papers.get(req.params.id);
      if (!paper) return res.status(404).json({ error: "Paper not found" });

      if (process.env.CONTRACT_ADDRESS && process.env.PRIVATE_KEY) {
        const contract = getContract();
        const tx = await contract.purchasePaper(0, { value: paper.price });
        const receipt = await tx.wait();
        return res.json({ success: true, txHash: receipt.hash });
      }

      // Mock purchase
      res.json({ success: true, mock: true, message: "Purchase recorded (mock)" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
