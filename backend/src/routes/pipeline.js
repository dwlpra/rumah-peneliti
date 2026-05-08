/**
 * Pipeline Routes
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { getPipelineStatus, pipelineSSE, pipelineProgress } = require("../controllers/pipeline-controller");

const router = Router();

router.get("/status", asyncHandler(getPipelineStatus));
router.get("/:id/progress", asyncHandler(pipelineProgress));
router.get("/:id/stream", pipelineSSE);   // SSE (bukan async, long-lived connection)
router.get("/:id/status", pipelineSSE);   // legacy SSE path

module.exports = router;
