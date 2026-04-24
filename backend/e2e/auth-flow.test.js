/**
 * E2E Auth Flow Test
 *
 * Tests the complete wallet authentication pipeline:
 *   1. Request nonce
 *   2. Sign nonce with wallet
 *   3. Verify signature → get JWT
 *   4. Upload paper with auth token
 *   5. Test protected endpoints
 */

const { ethers } = require("ethers");
const http = require("http");
const fs = require("fs");

// Test wallet (same as backend dev wallet)
const PK = "0x5f15fab105aae0c161870ad56a5ea35c215394fabcbe98cf19b2ead61e992103";
const ADDR = "0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55";
const API = "http://localhost:3001";

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  PASS: ${label}`);
    passed++;
  } else {
    console.log(`  FAIL: ${label}`);
    failed++;
  }
}

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(API + path, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    }).on("error", reject);
  });
}

function post(path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      hostname: "localhost", port: 3001, path, method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(data), ...headers },
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

function del(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "localhost", port: 3001, path, method: "DELETE", headers,
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on("error", reject);
    req.end();
  });
}

async function uploadPaper(token) {
  const FormData = require("form-data");
  const form = new FormData();
  form.append("title", "E2E Auth Test Paper");
  form.append("authors", "akzmee");
  form.append("abstract", "Full authentication pipeline test");
  form.append("file", fs.createReadStream("/tmp/e2e-test-paper.txt"));

  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: "localhost", port: 3001, path: "/api/papers", method: "POST",
      headers: { ...form.getHeaders(), "Authorization": `Bearer ${token}` },
    }, res => {
      let d = "";
      res.on("data", c => d += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    form.pipe(req);
  });
}

async function runTests() {
  const wallet = new ethers.Wallet(PK);
  let token = null;

  console.log("\n=== PUBLIC ENDPOINTS ===\n");

  // Health check
  const health = await get("/api/health");
  assert(health.status === 200 && health.data.status === "ok", "Health check returns 200 OK");

  // Papers list (public)
  const papers = await get("/api/papers");
  assert(papers.status === 200, "Papers list is public (200)");

  // Articles list (public)
  const articles = await get("/api/articles");
  assert(articles.status === 200, "Articles list is public (200)");

  // Pipeline status (public)
  const pipeline = await get("/api/pipeline/status");
  assert(pipeline.status === 200 && pipeline.data.chain.chainId === 16661, "Pipeline status shows mainnet");

  // Activity feed (public)
  const activity = await get("/api/papers/activity");
  assert(activity.status === 200, "Activity feed is public (200)");

  console.log("\n=== PROTECTED ENDPOINTS (without auth) ===\n");

  // Upload without auth
  const uploadNoAuth = await post("/api/papers", { title: "test" });
  assert(uploadNoAuth.status === 401, "Upload without auth returns 401");
  assert(uploadNoAuth.data.error === "Wallet authentication required", "Upload error message correct");

  // Delete without auth
  const deleteNoAuth = await del("/api/papers/1");
  assert(deleteNoAuth.status === 401, "Delete without auth returns 401");

  // Purchase without auth
  const purchaseNoAuth = await post("/api/papers/1/purchase", { buyer_wallet: ADDR });
  assert(purchaseNoAuth.status === 401, "Purchase without auth returns 401");

  console.log("\n=== AUTH FLOW ===\n");

  // Step 1: Get nonce
  const nonceRes = await get(`/api/auth/nonce?address=${ADDR}`);
  assert(nonceRes.status === 200, "Nonce request returns 200");
  assert(!!nonceRes.data.nonce, "Nonce is present in response");
  const nonce = nonceRes.data.nonce;

  // Step 2: Sign nonce
  const signature = await wallet.signMessage(nonce);
  assert(signature.length === 132, "Signature is valid hex (132 chars)");

  // Step 3: Verify signature
  const verifyRes = await post("/api/auth/verify", { address: ADDR, signature });
  assert(verifyRes.status === 200, "Verify returns 200");
  assert(verifyRes.data.success === true, "Verify returns success");
  assert(!!verifyRes.data.token, "Token is present");
  token = verifyRes.data.token;

  // Step 4: Wrong signature should fail
  const wrongSig = await post("/api/auth/verify", { address: ADDR, signature: "0x" + "00".repeat(65) });
  assert(wrongSig.status === 400 || wrongSig.status === 401, "Wrong signature rejected");

  // Step 5: Check /me with token
  const meRes = await get(`/api/auth/me`);
  // No token = 401
  assert(meRes.status === 401, "/me without token returns 401");

  console.log("\n=== AUTHENTICATED OPERATIONS ===\n");

  // Upload with auth
  const uploadRes = await uploadPaper(token);
  assert(uploadRes.status === 200, "Upload with auth returns 200");
  assert(uploadRes.data.success === true, "Upload succeeds with auth");
  if (uploadRes.data.pipeline) {
    assert(uploadRes.data.pipeline.storageUploaded === true, "0G Storage upload works");
  }

  // Purchase with auth
  const purchaseRes = await post("/api/papers/1/purchase",
    { buyer_wallet: ADDR, tx_hash: "0xtest_e2e_auth", amount: "0" },
    { Authorization: `Bearer ${token}` }
  );
  assert(purchaseRes.status === 200, "Purchase with auth returns 200");

  // Duplicate purchase
  const dupPurchase = await post("/api/papers/1/purchase",
    { buyer_wallet: ADDR, tx_hash: "0xdup", amount: "0" },
    { Authorization: `Bearer ${token}` }
  );
  assert(dupPurchase.data.existing === true, "Duplicate purchase detected");

  // Chat with auth
  const chatRes = await post("/api/papers/1/chat",
    { message: "What is this paper about?" },
    { Authorization: `Bearer ${token}` }
  );
  assert(chatRes.status === 200, "Chat with auth returns 200");
  assert(!!chatRes.data.reply, "Chat returns a reply");

  console.log("\n=== RESULTS ===\n");
  console.log(`  Passed: ${passed}`);
  console.log(`  Failed: ${failed}`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error("Test runner error:", err);
  process.exit(1);
});
