import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: ["*.spec.js"],
  timeout: 120000,
  retries: 1,
  use: {
    baseURL: process.env.FRONTEND_URL || "http://localhost:3000",
    actionTimeout: 15000,
    headless: true,
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
