/**
 * Health Check Controller
 *
 * Endpoint sederhana untuk cek apakah API berjalan normal.
 * Dipakai untuk monitoring dan Docker health check.
 */

const { db } = require("../db");

function healthCheck(req, res) {
  const papers = db.prepare("SELECT COUNT(*) as c FROM papers").get().c;
  const articles = db.prepare("SELECT COUNT(*) as c FROM articles").get().c;

  res.json({
    status: "ok",
    papers,
    articles,
    network: "0G Mainnet",
    chainId: 16661,
  });
}

module.exports = healthCheck;
