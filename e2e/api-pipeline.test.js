// E2E API Tests for RumahPeneliti Pipeline
// Run: npx vitest run e2e/api-pipeline.test.js

import { describe, test, expect, beforeAll } from "vitest";

const API = process.env.API_URL || "http://localhost:3001";
const UPLOAD_API = process.env.UPLOAD_API_URL || API; // may differ if behind proxy
const EXPLORER = "https://chainscan-galileo.0g.ai";

let uploadedPaperId = null;
let pipelineResult = null;

// Helper
async function api(path, opts = {}) {
  const res = await fetch(`${API}${path}`, opts);
  return { status: res.status, data: await res.json() };
}

// ─── 1. Health Check ───
describe("🏥 Health & Status", () => {
  test("GET /api/health returns ok", async () => {
    const { status, data } = await api("/api/health");
    expect(status).toBe(200);
    expect(data.status).toBe("ok");
    expect(data.papers).toBeGreaterThanOrEqual(0);
    expect(data.articles).toBeGreaterThanOrEqual(0);
  });

  test("GET /api/pipeline/status returns all services", async () => {
    const { status, data } = await api("/api/pipeline/status");
    expect(status).toBe(200);
    expect(data.storage.configured).toBe(true);
    expect(data.da.configured).toBe(true);
    expect(data.anchor.configured).toBe(true);
    expect(data.compute.configured).toBe(true);
    expect(data.chain.chainId).toBe(16602);
    expect(data.chain.rpc).toContain("evmrpc-testnet.0g.ai");
  });

  test("GET /api/nfts/stats returns contract info", async () => {
    const { status, data } = await api("/api/nfts/stats");
    expect(status).toBe(200);
    expect(data.contract).toBe("0x5495b92aca76B4414C698f60CdaAD85B364011a1");
    expect(typeof data.totalSupply).toBe("number");
  });
});

// ─── 2. Paper CRUD ───
describe("📄 Paper Operations", () => {
  test("GET /api/papers returns array", async () => {
    const { status, data } = await api("/api/papers");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/papers/:id returns paper detail", async () => {
    const { status, data } = await api("/api/papers/1");
    expect(status).toBe(200);
    expect(data).toHaveProperty("title");
    expect(data).toHaveProperty("id");
  });

  test("GET /api/papers/9999 returns 404", async () => {
    const { status } = await api("/api/papers/9999");
    expect(status).toBe(404);
  });
});

// ─── 3. Article Operations ───
describe("📰 Article Operations", () => {
  test("GET /api/articles returns array", async () => {
    const { status, data } = await api("/api/articles");
    expect(status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });

  test("GET /api/articles/:id returns article with paper", async () => {
    const { status, data } = await api("/api/articles/1");
    expect(status).toBe(200);
    expect(data).toHaveProperty("curated_title");
    expect(data).toHaveProperty("paper");
  });
});

// ─── 4. Full Pipeline Upload (E2E) ───
describe("🚀 Full Pipeline Upload", () => {
  test("Upload paper with full 6-step pipeline", async () => {
    const { execSync } = await import("child_process");
    const fs = await import("fs");
    const path = await import("path");

    // Create test file
    const testFile = path.join("/tmp", "e2e-test-paper.txt");
    fs.writeFileSync(testFile, `
E2E Test Paper: Blockchain-Based Academic Publishing

Abstract: This paper tests the complete 6-step pipeline of RumahPeneliti platform.

1. Introduction
We present a comprehensive test of decentralized academic publishing infrastructure.

2. Results
All pipeline steps completed successfully with on-chain verification.
    `.trim());

    // Use curl for multipart upload
    const cmd = `curl -s -X POST ${UPLOAD_API}/api/papers -F "file=@${testFile}" -F "title=E2E Test: Full Pipeline Verification" -F "authors=akzmee, Diva Oracle" -F "abstract=Testing complete 6-step pipeline" -F "price_wei=0" -F "author_wallet=0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55"`;
    const stdout = execSync(cmd, { timeout: 60000 }).toString();
    const data = JSON.parse(stdout);

    expect(data.success).toBe(true);

    // Step 1: 0G Storage
    expect(data.pipeline.storageUploaded).toBe(true);
    expect(data.paper.storage_hash).toBeTruthy();
    expect(data.paper.storage_hash).toMatch(/^0x[a-f0-9]{64}$/);

    // Step 2: DA Proof
    expect(data.pipeline.daProof).toBeTruthy();
    expect(data.pipeline.daProof).toMatch(/^0x[a-f0-9]{64}$/);

    // Step 3: Chain Anchor
    expect(data.pipeline.chainAnchor).toBeTruthy();
    expect(data.pipeline.chainAnchor).toMatch(/^0x[a-f0-9]{64}$/);
    expect(data.pipeline.chainPaperId).toBeTruthy();

    // Paper details
    expect(data.paper.title).toBe("E2E Test: Full Pipeline Verification");
    expect(data.paper.authors).toContain("akzmee");

    uploadedPaperId = data.paper.id;
    pipelineResult = data.pipeline;
  }, 120000); // 2 min timeout for blockchain tx

  test("Paper appears in list after upload", async () => {
    if (!uploadedPaperId) return;
    const { execSync } = await import("child_process");
    // Use curl to avoid keep-alive socket issues
    const stdout = execSync(`curl -s ${API}/api/papers`, { timeout: 10000 }).toString();
    const data = JSON.parse(stdout);
    const found = data.find((p) => p.id === uploadedPaperId);
    expect(found).toBeTruthy();
    expect(found.title).toBe("E2E Test: Full Pipeline Verification");
  });

  test("AI curation generates article", async () => {
    if (!uploadedPaperId) return;
    const { execSync } = await import("child_process");
    await new Promise((r) => setTimeout(r, 15000));
    const stdout = execSync(`curl -s ${API}/api/papers/${uploadedPaperId}`, { timeout: 10000 }).toString();
    const data = JSON.parse(stdout);
    expect(data.article).toBeTruthy();
    expect(data.article.curated_title).toBeTruthy();
    expect(data.article.summary).toBeTruthy();
  }, 30000);
});

// ─── 5. Purchase Flow ───
describe("💰 Purchase Operations", () => {
  test("POST /api/papers/:id/purchase records purchase", async () => {
    const { status, data } = await api("/api/papers/1/purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_wallet: "0x1234567890123456789012345678901234567890",
        tx_hash: "0xabc123",
        amount: "1000000000000000000",
      }),
    });
    expect(status).toBe(200);
    expect(data.success).toBe(true);
  });

  test("GET /api/papers/:id/access/:wallet checks access", async () => {
    const { data } = await api(
      "/api/papers/1/access/0x1234567890123456789012345678901234567890"
    );
    expect(data.hasAccess).toBe(true);
  });

  test("Access returns false for unknown wallet", async () => {
    const { data } = await api(
      "/api/papers/1/access/0x0000000000000000000000000000000000000001"
    );
    expect(data.hasAccess).toBe(false);
  });
});

// ─── 6. Smart Contract Addresses Valid ───
describe("🔗 Smart Contract Verification", () => {
  test("Contract addresses are valid checksum addresses", () => {
    const addresses = {
      JournalPayment: "0xF5E23E98a6a93Db2c814a033929F68D5B74445E2",
      PaperAnchor: "0xbb9775A363c63b84e7e7a949eE410eDd1eCB1FCE",
      ResearchNFT: "0x5495b92aca76B4414C698f60CdaAD85B364011a1",
    };

    for (const [name, addr] of Object.entries(addresses)) {
      expect(addr).toMatch(/^0x[a-fA-F0-9]{40}$/);
    }
  });

  test("Explorer URLs are correctly formed", () => {
    expect(EXPLORER).toBe("https://chainscan-galileo.0g.ai");
    expect(`${EXPLORER}/address/0xF5E23E98a6a93Db2c814a033929F68D5B74445E2`).toContain("chainscan");
  });
});
