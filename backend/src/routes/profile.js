/**
 * Profile Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { getProfile } = require("../controllers/profile-controller");

const router = Router();

router.get("/dashboard", asyncHandler(require("../controllers/analytics-controller").getLeaderboard));
router.get("/:address", asyncHandler(getProfile));

module.exports = router;
