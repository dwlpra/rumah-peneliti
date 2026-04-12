const express = require("express");

module.exports = function () {
  const router = express.Router();

  // List all articles
  router.get("/", (req, res) => {
    const articles = Array.from(req.app.locals.articles.values());
    res.json(articles);
  });

  // Get article by paper ID
  router.get("/:paperId", (req, res) => {
    const article = req.app.locals.articles.get(req.params.paperId);
    if (!article) return res.status(404).json({ error: "Article not found yet" });
    res.json(article);
  });

  return router;
};
