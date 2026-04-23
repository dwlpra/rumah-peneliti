const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "..", "data", "rumahpeneliti.db");
const DB_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT DEFAULT '',
    abstract TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
    storage_hash TEXT DEFAULT '',
    upload_date TEXT DEFAULT (datetime('now')),
    price_wei TEXT DEFAULT '0',
    author_wallet TEXT DEFAULT ''
  );

  CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL UNIQUE,
    curated_title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    key_takeaways TEXT DEFAULT '[]',
    body TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    created_date TEXT DEFAULT (datetime('now')),
    is_mock INTEGER DEFAULT 0,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    buyer_wallet TEXT NOT NULL,
    tx_hash TEXT DEFAULT '',
    amount TEXT DEFAULT '0',
    purchase_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
  );
`);

// Migration: add storage_hash column if not exists
try {
  db.exec("ALTER TABLE papers ADD COLUMN storage_hash TEXT DEFAULT ''");
} catch (e) {}

// Migration: add ai_score column to articles
try {
  db.exec("ALTER TABLE articles ADD COLUMN ai_score TEXT DEFAULT NULL");
} catch (e) {}

// Migration: add classification + agent_meta columns
try {
  db.exec("ALTER TABLE articles ADD COLUMN classification TEXT DEFAULT NULL");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN agent_meta TEXT DEFAULT NULL");
} catch (e) {}

// Prepared statements
const stmts = {
  insertPaper: db.prepare(
    "INSERT INTO papers (title, authors, abstract, file_path, storage_hash, price_wei, author_wallet) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ),
  getPaper: db.prepare("SELECT * FROM papers WHERE id = ?"),
  listPapers: db.prepare("SELECT * FROM papers ORDER BY upload_date DESC"),
  deletePaper: db.prepare("DELETE FROM papers WHERE id = ?"),

  insertArticle: db.prepare(
    "INSERT OR REPLACE INTO articles (paper_id, curated_title, summary, key_takeaways, body, tags, is_mock, ai_score, classification, agent_meta) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ),
  getArticle: db.prepare("SELECT * FROM articles WHERE paper_id = ?"),
  getArticleById: db.prepare("SELECT * FROM articles WHERE id = ?"),
  listArticles: db.prepare(`
    SELECT a.*, p.title as paper_title, p.authors, p.price_wei, p.author_wallet
    FROM articles a JOIN papers p ON a.paper_id = p.id
    ORDER BY a.created_date DESC
  `),

  insertPurchase: db.prepare(
    "INSERT INTO purchases (paper_id, buyer_wallet, tx_hash, amount) VALUES (?, ?, ?, ?)"
  ),
  getPurchase: db.prepare(
    "SELECT * FROM purchases WHERE paper_id = ? AND buyer_wallet = ?"
  ),
  listPurchases: db.prepare(
    "SELECT * FROM purchases WHERE paper_id = ? ORDER BY purchase_date DESC"
  ),
};

// Helper: parse JSON fields
function parseArticle(row) {
  if (!row) return null;
  let aiScore = null, classification = null, agentMeta = null;
  try { aiScore = row.ai_score ? JSON.parse(row.ai_score) : null; } catch(e) {}
  try { classification = row.classification ? JSON.parse(row.classification) : null; } catch(e) {}
  try { agentMeta = row.agent_meta ? JSON.parse(row.agent_meta) : null; } catch(e) {}
  return {
    ...row,
    key_takeaways: JSON.parse(row.key_takeaways || "[]"),
    tags: JSON.parse(row.tags || "[]"),
    is_mock: !!row.is_mock,
    ai_score: aiScore,
    classification,
    agent_meta: agentMeta,
  };
}

function parseArticles(rows) {
  return rows.map(parseArticle);
}

// Seed demo data
function seedIfEmpty() {
  const count = db.prepare("SELECT COUNT(*) as c FROM papers").get().c;
  if (count > 0) return;

  const demo1 = stmts.insertPaper.run(
    "A Survey on Blockchain-based Decentralized Storage Systems",
    "Dr. Sarah Chen, Marcus Williams, Dr. Aisha Patel",
    "This paper surveys decentralized storage systems built on blockchain technology, comparing architectures, consensus mechanisms, and performance characteristics of major platforms including IPFS, Filecoin, Arweave, and 0G Storage.",
    "",
    "1000000000000000",
    "0x1234567890abcdef1234567890abcdef12345678"
  );

  stmts.insertArticle.run(
    demo1.lastInsertRowid,
    "The Future of Data Storage: How Blockchain is Rewriting the Rules",
    "A comprehensive survey reveals that blockchain-based storage systems are rapidly maturing, offering compelling alternatives to traditional cloud storage with better security, censorship resistance, and cost efficiency.",
    JSON.stringify([
      "Decentralized storage eliminates single points of failure inherent in cloud providers",
      "Filecoin leads in total storage capacity with over 15 EiB committed",
      "Content-addressed storage ensures data integrity without trusted third parties",
      "Hybrid architectures combining on-chain metadata with off-chain data show most promise",
    ]),
    `A groundbreaking survey of blockchain-based storage systems reveals a rapidly maturing ecosystem that could fundamentally reshape how we store and retrieve data. The researchers analyzed four major platforms — IPFS, Filecoin, Arweave, and 0G Storage — examining everything from consensus mechanisms to real-world performance.\n\nThe findings are striking. Decentralized storage systems have evolved from theoretical curiosities into production-grade infrastructure. Filecoin alone now hosts over 15 exbibytes of committed storage capacity, rivaling traditional cloud providers in scale.\n\nOne of the most important insights is how content-addressed storage eliminates the need for trusted intermediaries. Instead of relying on a cloud provider to keep your data intact, the content itself becomes its own fingerprint. Any tampering is immediately detectable, making these systems inherently more trustworthy.\n\nThe researchers also identified a compelling cost advantage. While traditional cloud storage charges ongoing fees that scale linearly with data volume, many blockchain storage systems offer one-time payment models. Over a 5-year horizon, the cost savings can be substantial, particularly for archival data.\n\nHowever, challenges remain. Retrieval latency is still higher than centralized alternatives, and the user experience lags behind the polish of established cloud services. The study notes that hybrid architectures — combining on-chain metadata with off-chain data storage — appear to offer the best balance of decentralization and performance.\n\nPerhaps most exciting is the emergence of programmable storage, where smart contracts can automatically manage data lifecycle, replication, and access control. This opens possibilities that simply don't exist in traditional storage paradigms.\n\nThe researchers conclude that while decentralized storage won't replace cloud providers overnight, the technology has reached an inflection point. As developer tools improve and costs continue to decrease, expect accelerated adoption across enterprises and applications.`,
    JSON.stringify(["blockchain", "decentralized-storage", "ipfs", "filecoin", "web3"]),
    0
  );

  const demo2 = stmts.insertPaper.run(
    "Smart Contract Vulnerability Detection using Machine Learning",
    "Dr. James Park, Dr. Elena Rossi, Kevin O'Brien",
    "This paper presents a novel approach to detecting vulnerabilities in Ethereum smart contracts using ensemble machine learning methods. The model achieves 94.2% accuracy on a dataset of 50,000 contracts, outperforming traditional static analysis tools.",
    "",
    "2000000000000000",
    "0xabcdef1234567890abcdef1234567890abcdef12"
  );

  stmts.insertArticle.run(
    demo2.lastInsertRowid,
    "AI That Catches Bugs Before They Become Billion-Dollar Exploits",
    "A new machine learning model achieves 94.2% accuracy in detecting smart contract vulnerabilities — potentially saving billions in prevented exploits. The research demonstrates that AI can outperform traditional security auditing tools.",
    JSON.stringify([
      "ML model achieves 94.2% vulnerability detection accuracy across 50,000 smart contracts",
      "Ensemble approach combining Random Forest, XGBoost, and BERT-based code analysis",
      "Detects reentrancy, integer overflow, and access control flaws with high precision",
      "Processes contracts 10x faster than traditional static analysis tools",
    ]),
    `Smart contract vulnerabilities have cost the blockchain ecosystem billions of dollars. From the infamous DAO hack to more recent DeFi exploits, buggy code has been a persistent thorn in the side of Web3 development. Now, a team of researchers believes machine learning could be the answer.\n\nTheir approach uses an ensemble of three different machine learning techniques — Random Forest for pattern-based detection, XGBoost for feature-rich classification, and a BERT-based model that understands the semantic meaning of Solidity code. Together, these methods achieve a remarkable 94.2% accuracy rate.\n\nWhat makes this particularly impressive is the dataset. The researchers compiled and manually verified 50,000 Ethereum smart contracts, labeling each with known vulnerability types. This is one of the largest labeled datasets of its kind, and it covers the most critical vulnerability categories: reentrancy attacks, integer overflows, and access control flaws.\n\nThe speed advantage is equally notable. Traditional static analysis tools can take minutes to scan a complex contract. This ML model processes the same contract in seconds — roughly 10x faster. For developers integrating security checks into CI/CD pipelines, this speed difference is a game-changer.\n\nInterestingly, the researchers found that combining ML with traditional tools produces the best results. The ML model catches vulnerabilities that static analysis misses (particularly subtle logic flaws), while static analysis catches issues that require understanding of low-level EVM behavior.\n\nThe team has open-sourced both the model and the dataset, encouraging the community to build upon their work. They're also developing a VS Code extension that would provide real-time vulnerability warnings as developers write smart contracts.\n\nWhile no automated tool can replace thorough security audits entirely, this research represents a significant step forward. As smart contracts become more complex and manage increasingly large value, AI-assisted security may become not just useful but essential.`,
    JSON.stringify(["smart-contracts", "machine-learning", "security", "ethereum", "vulnerability-detection"]),
    0
  );

  console.log("Seeded 2 demo papers with curated articles (English)");
}

seedIfEmpty();

module.exports = { db, stmts, parseArticle, parseArticles };
