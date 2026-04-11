const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "..", "data", "rumahpeneliti.db");
const DB_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT DEFAULT '',
    abstract TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
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

const stmts = {
  insertPaper: db.prepare("INSERT INTO papers (title, authors, abstract, file_path, price_wei, author_wallet) VALUES (?, ?, ?, ?, ?, ?)"),
  getPaper: db.prepare("SELECT * FROM papers WHERE id = ?"),
  listPapers: db.prepare("SELECT * FROM papers ORDER BY upload_date DESC"),
  insertArticle: db.prepare("INSERT OR REPLACE INTO articles (paper_id, curated_title, summary, key_takeaways, body, tags, is_mock) VALUES (?, ?, ?, ?, ?, ?, ?)"),
  getArticle: db.prepare("SELECT * FROM articles WHERE paper_id = ?"),
  getArticleById: db.prepare("SELECT * FROM articles WHERE id = ?"),
  listArticles: db.prepare("SELECT a.*, p.title as paper_title, p.authors, p.price_wei, p.author_wallet FROM articles a JOIN papers p ON a.paper_id = p.id ORDER BY a.created_date DESC"),
  insertPurchase: db.prepare("INSERT INTO purchases (paper_id, buyer_wallet, tx_hash, amount) VALUES (?, ?, ?, ?)"),
  getPurchase: db.prepare("SELECT * FROM purchases WHERE paper_id = ? AND buyer_wallet = ?"),
};

function parseArticle(row) {
  if (!row) return null;
  return { ...row, key_takeaways: JSON.parse(row.key_takeaways || "[]"), tags: JSON.parse(row.tags || "[]"), is_mock: !!row.is_mock };
}
function parseArticles(rows) { return rows.map(parseArticle); }

module.exports = { db, stmts, parseArticle, parseArticles };
