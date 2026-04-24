/**
 * Paper Routes
 *
 * URL mapping untuk operasi paper.
 *
 * Protected routes (perlu wallet auth):
 *   POST   /              Upload paper + pipeline
 *   DELETE /:id           Delete paper
 *   POST   /:id/purchase  Purchase paper
 *   POST   /:id/chat      AI chat
 *
 * Public routes (tanpa auth):
 *   GET    /              List papers
 *   GET    /:id           Get single paper
 *   GET    /:id/onchain   On-chain data
 *   GET    /activity      Activity feed
 *   GET    /:id/access/:wallet  Check access
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { requireAuth } = require("../middleware/auth");
const {
  uploadPaper,
  listPapers,
  getPaper,
  purchasePaper,
  checkAccess,
  deletePaper,
  getOnChainData,
  getActivity,
  chatAboutPaper,
} = require("../controllers/paper-controller");

module.exports = (upload) => {
  const router = Router();

  // ═══ Protected Routes (perlu wallet auth) ═══
  router.post("/", upload.single("file"), requireAuth, asyncHandler(uploadPaper));
  router.delete("/:id", requireAuth, asyncHandler(deletePaper));
  router.post("/:id/purchase", requireAuth, asyncHandler(purchasePaper));
  router.post("/:id/chat", requireAuth, asyncHandler(chatAboutPaper));

  // ═══ Public Routes (tanpa auth) ═══
  router.get("/", asyncHandler(listPapers));
  router.get("/activity", asyncHandler(getActivity));
  router.get("/:id", asyncHandler(getPaper));
  router.get("/:id/onchain", asyncHandler(getOnChainData));
  router.get("/:id/access/:wallet", asyncHandler(checkAccess));

  return router;
};
