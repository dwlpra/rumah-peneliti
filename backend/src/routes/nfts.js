/**
 * NFT Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { mintPaperNFT, getPaperNFT, getNFTStats, listNFTs } = require("../controllers/nft-controller");

const router = Router();

router.get("/", asyncHandler(listNFTs));
router.get("/stats", asyncHandler(getNFTStats));
router.post("/:id/mint", asyncHandler(mintPaperNFT));
router.get("/:id/nft", asyncHandler(getPaperNFT));

module.exports = router;
