import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Tests d'intégration contre un vrai Postgres (Docker) : `pnpm test:db`.
// Séparés des tests unitaires pour que `pnpm test` reste rapide et sans Docker.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      // Hors de Next.js, `server-only` refuserait d'être chargé.
      "server-only": fileURLToPath(
        new URL("./scripts/test-db/server-only.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["src/**/*.db.test.ts"],
    globalSetup: ["./scripts/test-db/global-setup.ts"],
    // Une seule base partagée : les fichiers passent l'un après l'autre.
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 120_000,
  },
});
