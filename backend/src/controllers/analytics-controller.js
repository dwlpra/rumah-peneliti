/**
 * Analytics Controller
 *
 * Business logic untuk halaman analytics:
 *   - Statistik (jumlah paper, article, purchase)
 *   - Chart data 7 hari terakhir
 *   - Top authors
 *   - Distribusi difficulty
 *   - Leaderboard
 */

const { db } = require("../db");

/** Dashboard analytics data */
function getDashboard(req, res) {
  const paperCount = db.prepare("SELECT COUNT(*) as c FROM papers").get().c;
  const articleCount = db.prepare("SELECT COUNT(*) as c FROM articles").get().c;
  const purchaseCount = db.prepare("SELECT COUNT(*) as c FROM purchases").get().c;
  const papers = db.prepare("SELECT id, upload_date FROM papers ORDER BY upload_date DESC").all();

  res.json({
    stats: { papers: paperCount, articles: articleCount, purchases: purchaseCount },
    chart: buildChartData(papers),
    topAuthors: getTopAuthors(),
    recentPapers: getRecentPapers(),
    recentArticles: getRecentArticles(),
    difficulties: getDifficultyDistribution(),
  });
}

/** Leaderboard data */
function getLeaderboard(req, res) {
  res.json({
    topAuthors: getTopAuthors(),
    topPapers: getTopPapersByScore(),
    verified: getVerifiedPapers(),
  });
}

// ============================================================
//  PRIVATE HELPERS
// ============================================================

/** Build chart data 7 hari terakhir */
function buildChartData(papers) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const dayLabel = d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const count = papers.filter(p => p.upload_date?.startsWith(dateStr)).length;
    days.push({ date: dateStr, label: dayLabel, papers: count });
  }
  return days;
}

/** Top authors berdasarkan jumlah paper */
function getTopAuthors() {
  return db.prepare(
    "SELECT author_wallet, authors as name, COUNT(*) as papers " +
    "FROM papers WHERE author_wallet != '' " +
    "GROUP BY author_wallet ORDER BY papers DESC LIMIT 10"
  ).all();
}

/** Paper terbaru */
function getRecentPapers() {
  return db.prepare(
    "SELECT id, title, upload_date FROM papers ORDER BY upload_date DESC LIMIT 5"
  ).all();
}

/** Artikel terbaru */
function getRecentArticles() {
  return db.prepare(
    "SELECT a.paper_id, a.curated_title, a.created_date, p.title as paper_title " +
    "FROM articles a JOIN papers p ON a.paper_id = p.id " +
    "ORDER BY a.created_date DESC LIMIT 5"
  ).all();
}

/** Distribusi difficulty dari AI classification */
function getDifficultyDistribution() {
  const difficulties = { beginner: 0, intermediate: 0, advanced: 0 };
  db.prepare("SELECT classification FROM articles WHERE classification IS NOT NULL")
    .all()
    .forEach(r => {
      try {
        const cls = JSON.parse(r.classification);
        if (cls.difficulty) {
          difficulties[cls.difficulty] = (difficulties[cls.difficulty] || 0) + 1;
        }
      } catch (_) {}
    });
  return difficulties;
}

/** Top papers berdasarkan AI score */
function getTopPapersByScore() {
  return db.prepare(
    "SELECT p.id, p.title, p.authors, a.ai_score " +
    "FROM papers p JOIN articles a ON p.id = a.paper_id " +
    "WHERE a.ai_score IS NOT NULL " +
    "ORDER BY json_extract(a.ai_score, '$.overall') DESC LIMIT 20"
  ).all().map(r => {
    try { r.ai_score = JSON.parse(r.ai_score); } catch (_) {}
    return r;
  });
}

/** Papers yang sudah terverifikasi (punya storage + article) */
function getVerifiedPapers() {
  return db.prepare(
    "SELECT p.id, p.title, p.storage_hash, a.curated_title " +
    "FROM papers p JOIN articles a ON p.id = a.paper_id " +
    "WHERE p.storage_hash != '' ORDER BY p.upload_date DESC LIMIT 20"
  ).all();
}

module.exports = { getDashboard, getLeaderboard };
