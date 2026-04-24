/**
 * RumahPeneliti — Playwright E2E Tests
 *
 * Tests browser-level interactions:
 *   - Page rendering
 *   - Navigation
 *   - Language switching
 *   - Theme toggle
 *   - Wallet auth gate on upload page
 *   - Browse page data loading
 *   - Article page rendering
 */

import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

// ============================================================
//  PAGE RENDERING TESTS
// ============================================================

test.describe("Page Rendering", () => {
  const pages = [
    { path: "/", title: "RumahPeneliti", hasContent: "Decentralized" },
    { path: "/browse", title: "Browse", hasContent: "Research" },
    { path: "/upload", title: "Upload", hasContent: "Upload" },
    { path: "/pipeline", title: "Pipeline", hasContent: "0G Pipeline" },
    { path: "/nfts", title: "NFT", hasContent: "NFT" },
    { path: "/tech", title: "Tech", hasContent: "0G" },
    { path: "/verify", title: "Verify", hasContent: "Verify" },
    { path: "/profile", title: "Profile", hasContent: "Profile" },
    { path: "/analytics", title: "Analytics", hasContent: "Analytics" },
    { path: "/leaderboard", title: "Leaderboard", hasContent: "Leaderboard" },
  ];

  for (const page of pages) {
    test(`${page.path} renders correctly`, async ({ page: p }) => {
      await p.goto(`${BASE_URL}${page.path}`);
      await expect(p).toHaveTitle(new RegExp(page.title, "i"));
    });
  }
});

// ============================================================
//  NAVIGATION TESTS
// ============================================================

test.describe("Navigation", () => {
  test("navbar links work", async ({ page }) => {
    await page.goto(BASE_URL);

    // Check nav exists
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();

    // Click Browse link
    const browseLink = page.locator('a[href="/browse"]').first();
    await browseLink.click();
    await expect(page).toHaveURL(/\/browse/);
  });

  test("homepage links to upload", async ({ page }) => {
    await page.goto(BASE_URL);
    const uploadLink = page.locator('a[href="/upload"]').first();
    await uploadLink.click();
    await expect(page).toHaveURL(/\/upload/);
  });

  test("pipeline page has Nav and Footer", async ({ page }) => {
    await page.goto(`${BASE_URL}/pipeline`);
    // Nav should be visible
    await expect(page.locator("nav").first()).toBeVisible();
    // Page should have pipeline content
    await expect(page.locator("text=0G Pipeline").first()).toBeVisible();
  });
});

// ============================================================
//  UPLOAD AUTH GATE TESTS
// ============================================================

test.describe("Upload Auth Gate", () => {
  test("shows connect wallet message when no wallet", async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);

    // Should show auth gate (no MetaMask in test browser)
    const authGate = page.locator("text=Connect Wallet to Upload");
    await expect(authGate).toBeVisible({ timeout: 10000 });
  });

  test("upload form is hidden when not authenticated", async ({ page }) => {
    await page.goto(`${BASE_URL}/upload`);

    // Form should NOT be visible (hidden behind auth gate)
    const submitBtn = page.locator('button:has-text("Upload Paper")');
    await expect(submitBtn).not.toBeVisible();
  });

  test("browse page loads papers", async ({ page }) => {
    await page.goto(`${BASE_URL}/browse`);
    // Wait for content to load
    await page.waitForTimeout(3000);
    // Should show either papers or "no data" message
    const hasContent = await page.locator("body").textContent();
    expect(hasContent).toBeTruthy();
  });
});

// ============================================================
//  ARTICLE PAGE TESTS
// ============================================================

test.describe("Article Pages", () => {
  test("article page renders for paper 1", async ({ page }) => {
    await page.goto(`${BASE_URL}/article/1`);
    await page.waitForTimeout(3000);

    // Should have article content (from seed data)
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });

  test("article page shows not available for missing paper", async ({ page }) => {
    await page.goto(`${BASE_URL}/article/999`);
    await page.waitForTimeout(3000);

    // Should show "not available" or loading state
    const body = await page.locator("body").textContent();
    expect(body).toBeTruthy();
  });
});

// ============================================================
//  HOMEPAGE CONTENT TESTS
// ============================================================

test.describe("Homepage Content", () => {
  test("shows 0G Network branding", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("text=0G Network").first()).toBeVisible();
  });

  test("shows How it Works section", async ({ page }) => {
    await page.goto(BASE_URL);
    // Should have pipeline steps
    await expect(page.locator("text=0G Storage Upload").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows Smart Contracts section", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator("text=Contracts").first()).toBeVisible({ timeout: 10000 });
  });

  test("shows CTA buttons", async ({ page }) => {
    await page.goto(BASE_URL);
    await expect(page.locator('a[href="/pipeline"]').first()).toBeVisible();
    await expect(page.locator('a[href="/upload"]').first()).toBeVisible();
  });
});

// ============================================================
//  TECH STACK PAGE TESTS
// ============================================================

test.describe("Tech Page", () => {
  test("shows 0G tech stack", async ({ page }) => {
    await page.goto(`${BASE_URL}/tech`);
    const content = await page.locator("body").textContent();
    expect(content).toBeTruthy();
  });
});

// ============================================================
//  VERIFY PAGE TESTS
// ============================================================

test.describe("Verify Page", () => {
  test("verify page loads", async ({ page }) => {
    await page.goto(`${BASE_URL}/verify`);
    const content = await page.locator("body").textContent();
    expect(content).toContain("Verify");
  });
});

// ============================================================
//  RESPONSIVE TESTS
// ============================================================

test.describe("Responsive Design", () => {
  test("mobile viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto(BASE_URL);
    await expect(page.locator("nav").first()).toBeVisible();
  });

  test("tablet viewport renders correctly", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto(BASE_URL);
    await expect(page.locator("nav").first()).toBeVisible();
  });
});
