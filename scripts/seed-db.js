#!/usr/bin/env node
/**
 * RumahPeneliti — Database Seed Script
 * 
 * Jalankan: node scripts/seed-db.js
 * 
 * Ini akan membuat database dengan schema + data sample.
 * Database location: backend/data/rumahpeneliti.db
 */

const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "backend", "data", "rumahpeneliti.db");

// Pastikan folder ada
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Hapus database lama kalau ada
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("🗑️  Old database removed");
}

const db = new Database(DB_PATH);

// ── Schema ──
db.exec(`
  CREATE TABLE papers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    authors TEXT DEFAULT '',
    abstract TEXT DEFAULT '',
    file_path TEXT DEFAULT '',
    upload_date TEXT DEFAULT (datetime('now')),
    price_wei TEXT DEFAULT '0',
    author_wallet TEXT DEFAULT '',
    storage_hash TEXT DEFAULT ''
  );

  CREATE TABLE articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL UNIQUE,
    curated_title TEXT NOT NULL,
    summary TEXT DEFAULT '',
    key_takeaways TEXT DEFAULT '[]',
    body TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',
    created_date TEXT DEFAULT (datetime('now')),
    is_mock INTEGER DEFAULT 0,
    ai_score TEXT DEFAULT NULL,
    classification TEXT DEFAULT NULL,
    agent_meta TEXT DEFAULT NULL,
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
  );

  CREATE TABLE purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    paper_id INTEGER NOT NULL,
    buyer_wallet TEXT NOT NULL,
    tx_hash TEXT DEFAULT '',
    amount TEXT DEFAULT '0',
    purchase_date TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (paper_id) REFERENCES papers(id) ON DELETE CASCADE
  );
`);

console.log("✅ Schema created");

// ── Seed Data ──
const seedSQL = path.join(__dirname, "db-seed.sql");
if (fs.existsSync(seedSQL)) {
  const sql = fs.readFileSync(seedSQL, "utf8");
  // Skip schema lines (CREATE TABLE), hanya ambil INSERT
  const inserts = sql.split("\n")
    .filter(line => line.startsWith("INSERT"))
    .join("\n");
  db.exec(inserts);
  console.log("✅ Seed data imported");
} else {
  console.log("⚠️  No db-seed.sql found. Database created with empty tables.");
}

// ── Verify ──
const papers = db.prepare("SELECT COUNT(*) as c FROM papers").get();
const articles = db.prepare("SELECT COUNT(*) as c FROM articles").get();
const purchases = db.prepare("SELECT COUNT(*) as c FROM purchases").get();

console.log(`📊 Papers: ${papers.c} | Articles: ${articles.c} | Purchases: ${purchases.c}`);

db.close();
console.log(`\n📁 Database: ${DB_PATH}`);
console.log("🎉 Done! Run 'cd backend && node src/index.js' to start.");
