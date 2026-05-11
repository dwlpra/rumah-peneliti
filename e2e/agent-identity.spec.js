import { test, expect } from "@playwright/test";

const API = process.env.API_URL || "http://localhost:3001";

test.describe("Agent Identity API", () => {
  test("GET /api/papers/agent/0 returns on-chain agent data", async ({ request }) => {
    const res = await request.get(`${API}/api/papers/agent/0`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();

    expect(data.tokenId).toBe("0");
    expect(data.name).toBe("AI Kurator");
    expect(data.agentTypeName).toBe("Kurator");
    expect(data.model).toContain("GLM-5");
    expect(data.capabilities).toEqual(["summarize", "score", "tag", "classify", "review"]);
    expect(data.active).toBe(true);
    expect(data.contractAddress).toMatch(/^0x[a-fA-F0-9]{40}$/);
  });

  test("article includes agent_token_id", async ({ request }) => {
    const res = await request.get(`${API}/api/papers/1`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    const article = data.article || {};

    expect(article.agent_token_id).toBeDefined();
    expect(article.agent_identity_contract || article.agent_nft_contract).toBeTruthy();
    expect(article.agent_meta).toBeTruthy();
    expect(article.agent_meta.agents_used.length).toBeGreaterThan(0);
  });
});

test.describe("Agent Identity UI", () => {
  test("article page shows Agent Identity card", async ({ page }) => {
    await page.goto("/article/1", { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);

    await expect(page.locator("text=On-Chain Agent Identity").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=AI Kurator").first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=VERIFIED").first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=GLM-5-FP8").first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=summarize").first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=View Contract").first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=ERC-7857").first()).toBeVisible({ timeout: 3000 });
    await expect(page.locator("text=Agentic ID #0").first()).toBeVisible({ timeout: 3000 });
  });

  test("explorer link points to correct contract", async ({ page }) => {
    await page.goto("/article/1", { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);

    const link = page.locator('a:has-text("View Contract")').first();
    await expect(link).toBeVisible({ timeout: 5000 });
    const href = await link.getAttribute("href");
    expect(href).toContain("chainscan.0g.ai");
  });

  test("AI Score section shows 0G Compute footer", async ({ page }) => {
    await page.goto("/article/1", { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(2000);

    await expect(page.locator("text=AI Research Score").first()).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=0G Compute Network").first()).toBeVisible({ timeout: 3000 });
  });

  test("no JavaScript errors on article page", async ({ page }) => {
    const errors = [];
    page.on("console", msg => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/article/1", { waitUntil: "networkidle", timeout: 20000 });
    await page.waitForTimeout(3000);
    const realErrors = errors.filter(e => !e.includes("net::") && !e.includes("Extension"));
    expect(realErrors.length).toBe(0);
  });
});
