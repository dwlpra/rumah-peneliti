/**
 * Auth Controller
 *
 * Handle wallet-based authentication:
 *   - GET  /nonce    — Generate nonce for wallet signing
 *   - POST /verify   — Verify signature, return JWT token
 *   - GET  /me       — Get current user info from token
 */

const {
  generateNonce,
  verifySignature,
  createToken,
  verifyToken,
  nonceStore,
} = require("../middleware/auth");

/**
 * Generate nonce untuk wallet address
 *
 * Frontend memanggil endpoint ini lalu meminta user
 * men-sign nonce dengan MetaMask.
 */
function getNonce(req, res) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "address parameter required" });
  }

  const nonce = generateNonce(address);
  res.json({ nonce });
}

/**
 * Verifikasi signature dan buat JWT token
 *
 * Setelah user sign nonce, frontend kirim:
 *   { address, signature }
 *
 * Backend verifikasi bahwa signature benar-benar dari address tersebut.
 * Kalau valid, kirim JWT token yang berlaku 24 jam.
 */
function verifyLogin(req, res) {
  const { address, signature } = req.body;

  if (!address || !signature) {
    return res.status(400).json({ error: "address and signature required" });
  }

  // Ambil nonce yang tersimpan untuk address ini
  const stored = nonceStore.get(address.toLowerCase());

  if (!stored) {
    return res.status(400).json({ error: "No nonce found. Request a new nonce first." });
  }

  // Cek apakah nonce sudah expired (5 menit)
  if (Date.now() > stored.expires) {
    nonceStore.delete(address.toLowerCase());
    return res.status(400).json({ error: "Nonce expired. Request a new one." });
  }

  // Verifikasi signature
  const verifiedAddress = verifySignature(address, signature, stored.nonce);

  if (!verifiedAddress) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  // Hapus nonce yang sudah dipakai (one-time use)
  nonceStore.delete(address.toLowerCase());

  // Buat JWT token
  const token = createToken(verifiedAddress);

  res.json({
    success: true,
    token,
    address: verifiedAddress,
    message: "Wallet authenticated successfully",
  });
}

/**
 * Get current user info dari JWT token
 */
function getMe(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }

  const token = authHeader.split(" ")[1];
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  res.json({
    address: decoded.address,
    authenticated: true,
  });
}

module.exports = { getNonce, verifyLogin, getMe };
