/**
 * Article Controller
 *
 * Business logic untuk operasi artikel hasil AI curation:
 *   - List semua artikel
 *   - Get artikel by ID (termasuk data paper asli)
 */

const { stmts, parseArticle, parseArticles } = require("../db");

/** List semua artikel yang sudah dikurasi AI */
function listArticles(req, res) {
  const articles = parseArticles(stmts.listArticles.all());
  res.json(articles);
}

/**
 * Get artikel berdasarkan ID
 *
 * Mencari artikel berdasarkan:
 *   1. Article ID (primary)
 *   2. Paper ID (fallback, karena 1 paper = 1 artikel)
 *
 * Response termasuk data paper asli.
 */
function getArticle(req, res) {
  // Cari berdasarkan article ID
  let article = stmts.getArticle.get(req.params.id);

  // Fallback: cari berdasarkan paper ID
  if (!article) {
    article = stmts.getArticleById.get(req.params.id);
  }

  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  const paper = stmts.getPaper.get(article.paper_id);
  res.json({ ...parseArticle(article), paper });
}

module.exports = { listArticles, getArticle };
