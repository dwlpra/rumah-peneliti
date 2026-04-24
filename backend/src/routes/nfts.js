/**
 * NFT Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { mintPaperNFT, getPaperNFT, getNFTStats } = require("../controllers/nft-controller");

const router = Router();

router.post("/:id/mint", asyncHandler(mintPaperNFT));
router.get("/:id/nft", asyncHandler(getPaperNFT));
router.get("/stats", asyncHandler(getNFTStats));

module.exports = router;
