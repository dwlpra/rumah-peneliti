/**
 * Leaderboard Controller
 *
 * Returns top authors, top papers by AI score, and verified papers.
 */

const { db, parseArticle } = require("../db");

function getLeaderboard(req, res) {
  // Top authors by paper count
  const topAuthors = db.prepare(`
    SELECT p.author_wallet AS wallet, p.authors AS name, COUNT(*) AS count
    FROM papers p
    WHERE p.author_wallet != '' AND p.author_wallet IS NOT NULL
    GROUP BY p.author_wallet
    ORDER BY count DESC
    LIMIT 20
  `).all();

  // Top papers by AI score (overall)
  const topPapers = db.prepare(`
    SELECT p.id, p.title, p.slug, a.ai_score, a.classification
    FROM papers p
    JOIN articles a ON a.paper_id = p.id
    WHERE a.ai_score IS NOT NULL
    ORDER BY JSON_EXTRACT(a.ai_score, '$.overall') DESC
    LIMIT 20
  `).all().map((row) => {
    let aiScore = null;
    let difficulty = null;
    try { aiScore = JSON.parse(row.ai_score)?.overall ?? null; } catch {}
    try { difficulty = JSON.parse(row.classification)?.difficulty ?? null; } catch {}
    return { id: row.id, title: row.title, slug: row.slug, aiScore, difficulty };
  });

  // Verified papers (have storage hash = anchored on-chain)
  const verified = db.prepare(`
    SELECT p.id, p.title, p.storage_hash, p.upload_date AS anchorDate
    FROM papers p
    WHERE p.storage_hash IS NOT NULL AND p.storage_hash != ''
    ORDER BY p.upload_date DESC
    LIMIT 20
  `).all();

  res.json({ topAuthors, topPapers, verified });
}

module.exports = { getLeaderboard };
