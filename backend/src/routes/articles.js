/**
 * Article Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { listArticles, getArticle } = require("../controllers/article-controller");

const router = Router();

router.get("/", asyncHandler(listArticles));
router.get("/:id", asyncHandler(getArticle));

module.exports = router;
