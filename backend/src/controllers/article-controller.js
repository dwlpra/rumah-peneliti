/**
 * Article Controller
 *
 * Business logic untuk operasi artikel hasil AI curation:
 *   - List semua artikel
 *   - Get artikel by ID (termasuk data paper asli)
 */

const { stmts, parseArticle, parseArticles } = require("../db");

/**
 * Resolve article from URL param — supports numeric paper_id, article id, or slug.
 */
function resolveArticle(param) {
  // Try numeric paper_id first
  let article = stmts.getArticle.get(param);
  if (article) return article;

  // Try article id
  article = stmts.getArticleById.get(param);
  if (article) return article;

  // Try slug → find paper → find article
  const paper = stmts.getPaperBySlug.get(param);
  if (paper) {
    article = stmts.getArticle.get(paper.id);
    if (article) return article;
  }

  return null;
}

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
  const article = resolveArticle(req.params.id);
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }

  const paper = stmts.getPaper.get(article.paper_id);
  res.json({ ...parseArticle(article), paper });
}

module.exports = { listArticles, getArticle };
