/**
 * Analytics Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { getDashboard } = require("../controllers/analytics-controller");

const router = Router();

router.get("/dashboard", asyncHandler(getDashboard));

module.exports = router;
