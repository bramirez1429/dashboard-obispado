import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: "**/*.setup.ts",
    },
    {
      name: "chromium",
      testIgnore: [
        "**/*.setup.ts",
        "tests/e2e/dashboard/**",
        "tests/e2e/discursos/**",
        "tests/e2e/minuta/**",
      ],
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "webkit",
      testIgnore: [
        "**/*.setup.ts",
        "tests/e2e/dashboard/**",
        "tests/e2e/discursos/**",
        "tests/e2e/minuta/**",
      ],
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "authenticated-chromium",
      dependencies: ["auth-setup"],
      testMatch: [
        "tests/e2e/dashboard/**/*.spec.ts",
        "tests/e2e/discursos/**/*.spec.ts",
        "tests/e2e/minuta/**/*.spec.ts",
      ],
      use: {
        ...devices["Desktop Chrome"],
        storageState: "playwright/.auth/admin.json",
      },
    },
  ],
  webServer: {
    command: "npm run dev",
    reuseExistingServer: !process.env.CI,
    url: "http://localhost:3000",
  },
});
