/**
 * Auth Routes
 *
 * Wallet-based authentication endpoints:
 *   GET  /nonce     — Get signing nonce
 *   POST /verify    — Verify signature, get JWT
 *   GET  /me        — Check current auth status
 */

const { Router } = require("express");
const { asyncHandler } = require("../middleware/error-handler");
const { getNonce, verifyLogin, getMe } = require("../controllers/auth-controller");

const router = Router();

router.get("/nonce", asyncHandler(getNonce));
router.post("/verify", asyncHandler(verifyLogin));
router.get("/me", asyncHandler(getMe));

module.exports = router;
