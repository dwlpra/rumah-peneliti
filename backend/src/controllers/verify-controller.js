/**
 * Verify Controller
 *
 * Business logic untuk verifikasi hash on-chain.
 * Cek apakah hash ada di Paper Anchor, Article Anchor, atau NFT events.
 */

const { verifyHash } = require("../utils/ponder");

async function verify(req, res) {
  const result = await verifyHash(req.params.hash);
  res.json(result);
}

module.exports = { verify };
