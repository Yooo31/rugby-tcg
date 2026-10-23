import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test/setup.ts"],
    // Tests contre Postgres : `pnpm test:db` (vitest.db.config.mts).
    exclude: ["**/node_modules/**", "src/**/*.db.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "lcov"],
      // Surface au seuil bloquant : le domaine pur, les dépôts et les utilitaires.
      // Les composants sont testés mais hors seuil (effets visuels peu testables).
      include: [
        "src/domain/**/*.ts",
        "src/data/**/*.ts",
        "src/lib/**/*.ts",
        "scripts/import-clubs/parse.ts",
        "scripts/import-clubs/colors.ts",
      ],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        "**/index.ts",
        "src/data/catalog/clubs.regional.ts",
        // Couches d'entrée-sortie (base, session) : vérifiées en conditions réelles, pas en test unitaire.
        "src/lib/db.ts",
        // Requêtes Postgres : couvertes par les tests d'intégration (`pnpm test:db`).
        "src/data/server/prisma-store.ts",
        "src/data/server/admin.ts",
        "src/data/server/giveaways.ts",
        "src/data/server/leaderboard.ts",
        "src/data/server/rate-limit.ts",
        "src/data/server/account.ts",
        "src/data/server/referral.ts",
        "src/data/server/notifications.ts",
        // Appel réseau vers les services de notification : vérifié en conditions réelles.
        "src/data/server/web-push.ts",
        "src/lib/supabase/env.ts",
        "src/lib/supabase/server.ts",
        "src/lib/supabase/proxy.ts",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 85,
        statements: 90,
      },
    },
  },
});
