/**
 * Auth Middleware — Wallet-based Authentication
 *
 * Cara kerja (mirip SIWE — Sign-In with Ethereum):
 *   1. User connect wallet di frontend
 *   2. Frontend minta nonce dari backend: GET /api/auth/nonce?address=0x...
 *   3. User sign nonce dengan MetaMask: personal_sign(nonce, address)
 *   4. Frontend kirim signature ke backend: POST /api/auth/verify
 *   5. Backend verifikasi signature → buat JWT token
 *   6. Frontend simpan token, kirim di setiap request yang butuh auth
 *
 * Analogi sederhana:
 *   Nonce     = "Kode verifikasi sekali pakai" yang diminta user
 *   Signature = "Tanda tangan digital" yang membuktikan kepemilikan wallet
 *   JWT Token = "Kartu ID" yang berlaku 24 jam, tidak perlu sign ulang
 */

const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");

const JWT_SECRET = process.env.JWT_SECRET || "rumahpeneliti-secret-change-in-production";
const JWT_EXPIRY = "24h";  // Token berlaku 24 jam

// Nonce storage (in-memory, cukup untuk hackathon)
// Production: pakai Redis atau database
const nonceStore = new Map();

/**
 * Generate nonce untuk wallet address
 *
 * Nonce adalah string unik yang harus di-sign oleh wallet.
 * Berlaku 5 menit, setelah itu harus minta baru.
 */
function generateNonce(address) {
  const nonce = `RumahPeneliti Login\n\nNonce: ${Date.now()}-${Math.random().toString(36).slice(2)}`;
  nonceStore.set(address.toLowerCase(), {
    nonce,
    expires: Date.now() + 5 * 60 * 1000,  // 5 menit
  });
  return nonce;
}

/**
 * Verifikasi signature dari wallet
 *
 * @param {string} address  - Wallet address yang claim punya private key
 * @param {string} signature - Hasil sign nonce dengan private key
 * @returns {string|null} - Verified address atau null
 */
function verifySignature(address, signature, nonce) {
  try {
    // Recover address dari signature + nonce
    const recovered = ethers.verifyMessage(nonce, signature);

    // Bandingkan address yang di-claim vs yang di-recover dari signature
    if (recovered.toLowerCase() === address.toLowerCase()) {
      return recovered;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Buat JWT token untuk address yang sudah terverifikasi
 */
function createToken(address) {
  return jwt.sign(
    {
      address: address.toLowerCase(),
      iat: Math.floor(Date.now() / 1000),
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Verifikasi JWT token dari request
 *
 * @param {string} token - JWT token dari Authorization header
 * @returns {object|null} - Decoded payload atau null
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/**
 * Express middleware: requireAuth
 *
 * Cek apakah request punya valid JWT token.
 * Kalau valid, tambah req.user = { address }.
 * Kalau tidak valid, return 401 Unauthorized.
 *
 * Cara pakai di route:
 *   router.post("/upload", requireAuth, uploadHandler);
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Wallet authentication required",
      hint: "Connect your wallet and sign the message to authenticate",
    });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: "Invalid or expired token",
      hint: "Please re-connect your wallet",
    });
  }

  // Inject user info ke request
  req.user = { address: decoded.address };
  next();
}

module.exports = {
  generateNonce,
  verifySignature,
  createToken,
  verifyToken,
  requireAuth,
  nonceStore,
};
