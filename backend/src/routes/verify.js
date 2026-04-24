/**
 * Verify Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { verify } = require("../controllers/verify-controller");

const router = Router();

router.get("/:hash", asyncHandler(verify));

module.exports = router;
