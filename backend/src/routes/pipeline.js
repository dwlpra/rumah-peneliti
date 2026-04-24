/**
 * Pipeline Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { getPipelineStatus, pipelineSSE } = require("../controllers/pipeline-controller");

const router = Router();

router.get("/status", asyncHandler(getPipelineStatus));
router.get("/:id/status", pipelineSSE); // SSE (bukan async, long-lived connection)

module.exports = router;
