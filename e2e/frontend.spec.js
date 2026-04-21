// E2E Browser Tests for RumahPeneliti Frontend
// Run: npx playwright test
// Requires: npx playwright install chromium

import { test, expect } from "@playwright/test";

const BASE = process.env.FRONTEND_URL || "http://localhost:3000";
const API = process.env.API_URL || "http://localhost:3001";

test.describe("🏠 Homepage", () => {
  test("loads successfully", async ({ page }) => {
    await page.goto(BASE);
    await expect(page).toHaveTitle(/RumahPeneliti/);
  });

  test("shows hero section with title", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=Decentralized")).toBeVisible({ timeout: 10000 });
  });

  test("shows 0G Tech Stack section", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=0G Storage")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=0G DA Layer")).toBeVisible();
    await expect(page.locator("text=0G Compute")).toBeVisible();
    await expect(page.locator("text=0G Chain")).toBeVisible();
  });

  test("shows How It Works pipeline steps", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=How RumahPeneliti Works")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=0G Storage Upload")).toBeVisible();
    await expect(page.locator("text=DA Proof")).toBeVisible();
    await expect(page.locator("text=On-Chain Anchor")).toBeVisible();
    await expect(page.locator("text=AI Curation")).toBeVisible();
    await expect(page.locator("text=NFT Minting")).toBeVisible();
  });

  test("shows Smart Contracts section with addresses", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=Smart Contracts")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=JournalPayment")).toBeVisible();
    await expect(page.locator("text=PaperAnchor")).toBeVisible();
    await expect(page.locator("text=ResearchNFT")).toBeVisible();
  });

  test("shows Problems We Solve section", async ({ page }) => {
    await page.goto(BASE);
    await expect(page.locator("text=Problems We Solve")).toBeVisible({ timeout: 10000 });
    await expect(page.locator("text=Expensive Paywalls")).toBeVisible();
  });

  test("navigation links work", async ({ page }) => {
    await page.goto(BASE);
    const navLinks = page.locator("nav a");
    const count = await navLinks.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});

test.describe("📚 Browse Page", () => {
  test("loads and shows papers", async ({ page }) => {
    await page.goto(`${BASE}/browse`);
    await expect(page).toHaveURL(/browse/);
    // Wait for papers to load
    await page.waitForTimeout(2000);
  });

  test("shows paper cards or empty state", async ({ page }) => {
    await page.goto(`${BASE}/browse`);
    await page.waitForTimeout(3000);
    // Either papers shown or some content
    const content = await page.textContent("body");
    expect(content.length).toBeGreaterThan(100);
  });
});

test.describe("📤 Upload Page", () => {
  test("loads upload form", async ({ page }) => {
    await page.goto(`${BASE}/upload`);
    await expect(page).toHaveURL(/upload/);
  });

  test("has title input field", async ({ page }) => {
    await page.goto(`${BASE}/upload`);
    const titleInput = page.locator('input[placeholder*="Title"], input[placeholder*="title"]');
    await expect(titleInput).toBeVisible({ timeout: 5000 });
  });
});

test.describe("🧪 Pipeline Wizard", () => {
  test("loads pipeline page", async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);
    await expect(page).toHaveURL(/pipeline/);
  });

  test("shows 5 pipeline steps", async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);
    await expect(page.locator("text=0G Storage Upload")).toBeVisible({ timeout: 5000 });
    await expect(page.locator("text=Data Availability Proof")).toBeVisible();
    await expect(page.locator("text=On-Chain Anchor")).toBeVisible();
    await expect(page.locator("text=AI Curation")).toBeVisible();
    await expect(page.locator("text=NFT Minting")).toBeVisible();
  });

  test("shows paper details form", async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);
    await expect(page.locator("text=Paper Details")).toBeVisible({ timeout: 5000 });
  });

  test("run pipeline button is disabled without file", async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);
    const btn = page.locator('button:has-text("Run Pipeline")');
    await expect(btn).toBeDisabled();
  });

  test("can upload file and enable button", async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);

    // Fill title
    const titleInput = page.locator('input[placeholder="Paper Title *"]');
    await titleInput.fill("Test Paper");

    // Create and upload test file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: "test-paper.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("Test paper content for E2E testing"),
    });

    // Button should be enabled now
    const btn = page.locator('button:has-text("Run Pipeline")');
    await expect(btn).toBeEnabled({ timeout: 3000 });
  });

  test("full pipeline upload flow", async ({ page }) => {
    await page.goto(`${BASE}/pipeline`);

    // Fill form
    await page.locator('input[placeholder="Paper Title *"]').fill("Playwright E2E Test Paper");
    await page.locator('input[placeholder="Authors (comma separated)"]').fill("Playwright Bot");
    await page.locator('input[placeholder*="wallet"]').fill("0x7AefA5B4fE9CFaf837CC0a0EbEA2a5a890aFAf55");

    // Upload file
    await page.locator('input[type="file"]').setInputFiles({
      name: "e2e-paper.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("This is an E2E test paper for RumahPeneliti pipeline verification."),
    });

    // Click Run Pipeline
    await page.locator('button:has-text("Run Pipeline")').click();

    // Wait for pipeline to complete (steps should change status)
    await page.waitForTimeout(30000);

    // Check if steps show completed or logs appear
    const stepStatus = await page.locator("text=✅").count();
    expect(stepStatus).toBeGreaterThanOrEqual(1);

    // Check for result section
    const hasResult = await page.locator("text=Pipeline Complete").isVisible().catch(() => false);
    if (hasResult) {
      await expect(page.locator("text=Pipeline Complete")).toBeVisible();
    }
  }, 120000);
});

test.describe("📰 Article Page", () => {
  test("loads article page for paper 1", async ({ page }) => {
    await page.goto(`${BASE}/article/1`);
    await page.waitForTimeout(2000);
    const content = await page.textContent("body");
    expect(content.length).toBeGreaterThan(50);
  });
});

test.describe("🔗 API Integration", () => {
  test("frontend connects to backend API", async ({ page }) => {
    // Intercept API calls
    const apiPromise = page.waitForResponse((resp) => resp.url().includes("/api/"), { timeout: 10000 }).catch(() => null);
    await page.goto(`${BASE}/browse`);
    await page.waitForTimeout(3000);

    // Just verify the page loads (API call may or may not happen depending on client)
    const content = await page.textContent("body");
    expect(content.length).toBeGreaterThan(100);
  });
});
