/**
 * Verify Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { verify } = require("../controllers/verify-controller");

const router = Router();

// GET /api/verify?q=<paper-id-or-hash>
router.get("/", asyncHandler(verify));

// GET /api/verify/:hash (backward compatible)
router.get("/:hash", asyncHandler(verify));

module.exports = router;
