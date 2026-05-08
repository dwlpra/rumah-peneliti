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

// Migration: add slug column to papers
try {
  db.exec("ALTER TABLE papers ADD COLUMN slug TEXT DEFAULT ''");
} catch (e) {}

// Migration: add journal_id column (maps to JournalPayment contract paperId)
try {
  db.exec("ALTER TABLE papers ADD COLUMN journal_id INTEGER DEFAULT NULL");
} catch (e) {}

// Migration: add agent_token_id and agent_nft_contract to articles
try {
  db.exec("ALTER TABLE articles ADD COLUMN agent_token_id INTEGER DEFAULT NULL");
} catch (e) {}
try {
  db.exec("ALTER TABLE articles ADD COLUMN agent_nft_contract TEXT DEFAULT NULL");
} catch (e) {}

// Migration: backfill slugs for existing papers without one
{
  const papers = db.prepare("SELECT id, title, slug FROM papers WHERE slug = '' OR slug IS NULL").all();
  const updateStmt = db.prepare("UPDATE papers SET slug = ? WHERE id = ?");
  for (const p of papers) {
    const slug = generateSlug(p.title, p.id);
    updateStmt.run(slug, p.id);
  }
}

// Prepared statements
const stmts = {
  insertPaper: db.prepare(
    "INSERT INTO papers (title, authors, abstract, file_path, storage_hash, price_wei, author_wallet) VALUES (?, ?, ?, ?, ?, ?, ?)"
  ),
  getPaper: db.prepare("SELECT * FROM papers WHERE id = ?"),
  getPaperBySlug: db.prepare("SELECT * FROM papers WHERE slug = ?"),
  updateSlug: db.prepare("UPDATE papers SET slug = ? WHERE id = ?"),
  listPapers: db.prepare("SELECT * FROM papers ORDER BY upload_date DESC"),
  deletePaper: db.prepare("DELETE FROM papers WHERE id = ?"),

  insertArticle: db.prepare(
    "INSERT OR REPLACE INTO articles (paper_id, curated_title, summary, key_takeaways, body, tags, is_mock, ai_score, classification, agent_meta, agent_token_id, agent_nft_contract) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
  ),
  getArticle: db.prepare("SELECT * FROM articles WHERE paper_id = ?"),
  getArticleById: db.prepare("SELECT * FROM articles WHERE id = ?"),
  listArticles: db.prepare(`
    SELECT a.*, p.title as paper_title, p.authors, p.price_wei, p.author_wallet, p.slug
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
    agent_token_id: row.agent_token_id || null,
    agent_nft_contract: row.agent_nft_contract || null,
  };
}

function parseArticles(rows) {
  return rows.map(parseArticle);
}

// Helper: generate URL-safe slug from title + numeric ID for uniqueness
function generateSlug(title, paperId) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) + "-" + paperId;
}

// Seed demo data — disabled. Real papers come from the upload pipeline.
function seedIfEmpty() {
  // No demo data — all papers should be uploaded through the pipeline
  // so they're properly registered on JournalPayment + PaperAnchor contracts.
}

seedIfEmpty();

module.exports = { db, stmts, parseArticle, parseArticles, generateSlug };
