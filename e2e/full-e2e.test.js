/**
 * RumahPeneliti — Full E2E Test Suite
 *
 * Comprehensive end-to-end testing without browser (HTTP-level).
 * Covers: Auth flow, API endpoints, Frontend pages, Pipeline.
 *
 * Run: node e2e/full-e2e.test.js
 */

const { ethers } = require("ethers");
const http = require("http");
const fs = require("fs");

const API = "http://localhost:3001";
const WEB = "http://localhost:3000";
const PK = "0x5f15fab105aae0c161870ad56a5ea35c215394fabcbe98cf19b2ead61e992103";
const ADDR = "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55";

let passed = 0, failed = 0, token = null;

function ok(cond, label) {
  if (cond) { console.log(`  PASS: ${label}`); passed++; }
  else { console.log(`  FAIL: ${label}`); failed++; }
}

function req(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const isGet = method === "GET";
    const opts = {
      hostname: path.startsWith("http") ? new URL(path).hostname : "localhost",
      port: path.startsWith("http") ? new URL(path).port || (new URL(path).protocol === "https:" ? 443 : 80) : (path.includes(":3000") ? 3000 : 3001),
      path: path.startsWith("http") ? new URL(path).pathname + new URL(path).search : path,
      method, headers: { "Content-Type": "application/json", ...headers },
    };
    const r = http.request(opts, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d), headers: res.headers }); }
        catch { resolve({ status: res.statusCode, data: d, headers: res.headers }); }
      });
    });
    r.on("error", reject);
    if (!isGet && body) r.write(typeof body === "string" ? body : JSON.stringify(body));
    r.end();
  });
}

function fetchPage(path) {
  return new Promise((resolve, reject) => {
    http.get(WEB + path, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => resolve({ status: res.statusCode, html: d }));
    }).on("error", reject);
  });
}

async function run() {
  const wallet = new ethers.Wallet(PK);

  console.log("\n==============================");
  console.log("  RUMAHPENELITI E2E TEST SUITE");
  console.log("  ==============================\n");

  // ════════════════════════════════════
  //  1. FRONTEND PAGE RENDERING
  // ════════════════════════════════════
  console.log("1. FRONTEND PAGES\n");

  const pages = [
    "/", "/browse", "/upload", "/pipeline", "/nfts",
    "/article/1", "/article/999", "/tech", "/verify",
    "/profile", "/analytics", "/leaderboard",
  ];

  for (const p of pages) {
    const page = await fetchPage(p);
    ok(page.status === 200, `GET ${p} returns 200`);
  }

  // Homepage content checks
  const home = await fetchPage("/");
  ok(home.html.includes("RumahPeneliti"), "Homepage contains branding");
  ok(home.html.includes("0G Network") || home.html.includes("0G"), "Homepage mentions 0G");
  ok(home.html.includes("Storage Upload") || home.html.includes("Storage"), "Homepage shows pipeline steps");

  // Upload page auth gate
  const upload = await fetchPage("/upload");
  ok(upload.html.includes("Connect Wallet"), "Upload page has wallet auth gate");

  // ════════════════════════════════════
  //  2. PUBLIC API ENDPOINTS
  // ════════════════════════════════════
  console.log("\n2. PUBLIC API\n");

  const health = await req("GET", "/api/health");
  ok(health.status === 200 && health.data.status === "ok", "Health check OK");
  ok(typeof health.data.papers === "number", "Health returns paper count");

  const papers = await req("GET", "/api/papers");
  ok(papers.status === 200, "Papers list is public");
  ok(Array.isArray(papers.data.papers || papers.data), "Papers returns array");

  const articles = await req("GET", "/api/articles");
  ok(articles.status === 200, "Articles list is public");

  const pipeline = await req("GET", "/api/pipeline/status");
  ok(pipeline.data.storage?.configured === true, "Pipeline storage configured");
  ok(pipeline.data.chain?.chainId === 16661, "Pipeline shows mainnet chain ID");

  const activity = await req("GET", "/api/papers/activity");
  ok(activity.status === 200, "Activity feed accessible");

  const nftStats = await req("GET", "/api/nfts/stats");
  ok(nftStats.status === 200, "NFT stats accessible");
  ok(typeof nftStats.data.totalSupply === "number", "NFT totalSupply is number");

  const walletStatus = await req("GET", "/api/wallet/status");
  ok(walletStatus.status === 200, "Wallet status accessible");
  ok(walletStatus.data.canSponsor !== undefined, "Wallet shows sponsor status");

  // ════════════════════════════════════
  //  3. PROTECTED ENDPOINTS (NO AUTH)
  // ════════════════════════════════════
  console.log("\n3. AUTH PROTECTION\n");

  const uploadNoAuth = await req("POST", "/api/papers", { title: "test" });
  ok(uploadNoAuth.status === 401, "Upload rejected without auth");
  ok(uploadNoAuth.data.error.includes("authentication"), "Upload error mentions auth");

  const deleteNoAuth = await req("DELETE", "/api/papers/1");
  ok(deleteNoAuth.status === 401, "Delete rejected without auth");

  const purchaseNoAuth = await req("POST", "/api/papers/1/purchase", { buyer_wallet: ADDR });
  ok(purchaseNoAuth.status === 401, "Purchase rejected without auth");

  const chatNoAuth = await req("POST", "/api/papers/1/chat", { message: "test" });
  ok(chatNoAuth.status === 401, "Chat rejected without auth");

  // ════════════════════════════════════
  //  4. AUTH FLOW
  // ════════════════════════════════════
  console.log("\n4. WALLET AUTH FLOW\n");

  // Get nonce
  const nonceRes = await req("GET", `/api/auth/nonce?address=${ADDR}`);
  ok(nonceRes.status === 200, "Nonce endpoint returns 200");
  ok(!!nonceRes.data.nonce, "Nonce is present");

  // Sign nonce
  const nonce = nonceRes.data.nonce;
  const signature = await wallet.signMessage(nonce);
  ok(signature.length === 132, "Signature valid length");

  // Verify signature
  const verify = await req("POST", "/api/auth/verify", { address: ADDR, signature });
  ok(verify.status === 200, "Verify returns 200");
  ok(verify.data.success === true, "Auth successful");
  ok(!!verify.data.token, "JWT token received");
  token = verify.data.token;

  // Wrong signature
  const wrong = await req("POST", "/api/auth/verify", { address: ADDR, signature: "0x" + "00".repeat(65) });
  ok(wrong.status === 400 || wrong.status === 401, "Wrong signature rejected");

  // Expired nonce (reuse)
  const reuse = await req("POST", "/api/auth/verify", { address: ADDR, signature });
  ok(reuse.status === 400, "Nonce reuse rejected");

  // /me endpoint
  const meBad = await req("GET", "/api/auth/me");
  ok(meBad.status === 401, "/me without token returns 401");

  const meGood = await req("GET", "/api/auth/me", null, { Authorization: `Bearer ${token}` });
  ok(meGood.status === 200, "/me with valid token returns 200");
  ok(meGood.data.authenticated === true, "/me confirms authenticated");

  // ════════════════════════════════════
  //  5. AUTHENTICATED UPLOAD
  // ════════════════════════════════════
  console.log("\n5. AUTHENTICATED UPLOAD\n");

  const FormData = require("form-data");
  function uploadWithAuth(title, fileContent = "Test paper content") {
    return new Promise((resolve, reject) => {
      fs.writeFileSync("/tmp/e2e-test-upload.txt", fileContent);
      const form = new FormData();
      form.append("title", title);
      form.append("authors", "E2E Test");
      form.append("abstract", "Automated test upload");
      form.append("file", fs.createReadStream("/tmp/e2e-test-upload.txt"));

      const r = http.request({
        hostname: "localhost", port: 3001, path: "/api/papers", method: "POST",
        headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
      }, res => {
        let d = "";
        res.on("data", c => d += c);
        res.on("end", () => {
          try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
          catch { resolve({ status: res.statusCode, data: d }); }
        });
      });
      form.pipe(r);
    });
  }

  // Upload without file
  const noFile = await new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("title", "No file test");
    const r = http.request({
      hostname: "localhost", port: 3001, path: "/api/papers", method: "POST",
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    form.pipe(r);
  });
  ok(noFile.status === 400, "Upload without file rejected (400)");

  // Upload without title
  const noTitle = await new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", fs.createReadStream("/tmp/e2e-test-upload.txt"));
    const r = http.request({
      hostname: "localhost", port: 3001, path: "/api/papers", method: "POST",
      headers: { ...form.getHeaders(), Authorization: `Bearer ${token}` },
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, data: d }); } });
    });
    form.pipe(r);
  });
  ok(noTitle.status === 400, "Upload without title rejected (400)");

  // Successful upload
  const uploadResult = await uploadWithAuth("E2E Full Test Paper");
  ok(uploadResult.status === 200, "Upload with auth returns 200");
  ok(uploadResult.data.success === true, "Upload successful");
  ok(!!uploadResult.data.paper, "Upload returns paper data");
  ok(uploadResult.data.paper.author_wallet?.toLowerCase() === ADDR.toLowerCase(), "Paper author_wallet from auth token");

  // Pipeline results (may take a moment)
  if (uploadResult.data.pipeline) {
    ok(uploadResult.data.pipeline.storageUploaded === true, "0G Storage upload works");
    ok(!!uploadResult.data.pipeline.daProof, "DA proof generated");
    ok(!!uploadResult.data.pipeline.chainAnchor, "Chain anchor created");
  }

  // ════════════════════════════════════
  //  6. PURCHASE & ACCESS
  // ════════════════════════════════════
  console.log("\n6. PURCHASE & ACCESS\n");

  const authH = { Authorization: `Bearer ${token}` };

  const buy = await req("POST", "/api/papers/1/purchase", { buyer_wallet: ADDR }, authH);
  ok(buy.status === 200, "Purchase returns 200");
  ok(buy.data.success === true, "Purchase recorded");

  const dupBuy = await req("POST", "/api/papers/1/purchase", { buyer_wallet: ADDR }, authH);
  ok(dupBuy.data.existing === true, "Duplicate purchase detected");

  const access = await req("GET", `/api/papers/1/access/${ADDR}`);
  ok(access.data.hasAccess === true, "Access check returns true for buyer");

  const noAccess = await req("GET", "/api/papers/1/access/0x0000000000000000000000000000000000000001");
  ok(noAccess.data.hasAccess === false, "Access check returns false for non-buyer");

  // ════════════════════════════════════
  //  7. PAPER OPERATIONS
  // ════════════════════════════════════
  console.log("\n7. PAPER OPERATIONS\n");

  // Get single paper
  const paper = await req("GET", "/api/papers/1");
  ok(paper.status === 200, "Get paper returns 200");
  ok(!!paper.data.title, "Paper has title");
  ok(!!paper.data.article || paper.data.article === null, "Paper includes article (or null)");

  // Paper not found
  const notFound = await req("GET", "/api/papers/99999");
  ok(notFound.status === 404, "Non-existent paper returns 404");

  // On-chain data
  const onchain = await req("GET", "/api/papers/1/onchain");
  ok(onchain.status === 200, "On-chain data returns 200");
  ok(onchain.data.explorerBase === "https://chainscan.0g.ai", "On-chain includes explorer URL");

  // ════════════════════════════════════
  //  8. SEARCH & FILTER
  // ════════════════════════════════════
  console.log("\n8. SEARCH & FILTER\n");

  const search = await req("GET", "/api/papers?search=blockchain");
  ok(search.status === 200, "Search returns 200");

  const sorted = await req("GET", "/api/papers?sort=title");
  ok(sorted.status === 200, "Sort by title returns 200");

  const paged = await req("GET", "/api/papers?page=1&limit=1");
  ok(paged.status === 200, "Pagination returns 200");
  ok(paged.data.total !== undefined, "Pagination includes total");

  // ════════════════════════════════════
  //  9. ANALYTICS & PROFILE
  // ════════════════════════════════════
  console.log("\n9. ANALYTICS & PROFILE\n");

  const dashboard = await req("GET", "/api/analytics/dashboard");
  ok(dashboard.status === 200, "Analytics dashboard returns 200");
  ok(dashboard.data.stats !== undefined, "Dashboard has stats");
  ok(Array.isArray(dashboard.data.chart), "Dashboard has chart data");
  ok(Array.isArray(dashboard.data.topAuthors), "Dashboard has top authors");

  const leaderboard = await req("GET", "/api/profile/dashboard");
  ok(leaderboard.status === 200, "Leaderboard returns 200");

  const profile = await req("GET", `/api/profile/${ADDR}`);
  ok(profile.status === 200, "Profile returns 200");
  ok(profile.data.stats !== undefined, "Profile has stats");

  // ════════════════════════════════════
  //  10. VERIFY
  // ════════════════════════════════════
  console.log("\n10. HASH VERIFICATION\n");

  const verifyHash = await req("GET", "/api/verify/0x0000000000000000000000000000000000000000000000000000000000000000");
  ok(verifyHash.status === 200, "Verify returns 200");
  ok(verifyHash.data.verified === false, "Unknown hash not verified");

  // ════════════════════════════════════
  //  RESULTS
  // ════════════════════════════════════
  console.log("\n==============================");
  console.log(`  PASSED: ${passed}`);
  console.log(`  FAILED: ${failed}`);
  console.log(`  TOTAL:  ${passed + failed}`);
  console.log("==============================\n");

  process.exit(failed > 0 ? 1 : 0);
}

run().catch(err => { console.error("Test runner error:", err); process.exit(1); });
