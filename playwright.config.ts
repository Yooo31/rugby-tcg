import { defineConfig, devices } from "@playwright/test";
import { E2E_BASE_URL, E2E_PORT, e2eEnv } from "./scripts/e2e/env.mjs";

/**
 * Tests de bout en bout : l'application construite (`next build`), branchée
 * sur la pile Supabase locale. Prérequis : `pnpm e2e:supabase` puis
 * `pnpm e2e:prepare` (une fois). Lancer : `pnpm e2e`.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"]
    ? [["github"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: E2E_BASE_URL,
    locale: "fr-FR",
    timezoneId: "Europe/Paris",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "mobile", use: { ...devices["Pixel 7"] } },
    { name: "bureau", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: `pnpm build && pnpm exec next start --port ${E2E_PORT}`,
    url: `${E2E_BASE_URL}/connexion`,
    env: e2eEnv(),
    reuseExistingServer: !process.env["CI"],
    timeout: 300_000,
  },
});
