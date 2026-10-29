import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Seuil de couverture bloquant (CLAUDE.md) pour le domaine, les dépôts et les utilitaires. */
const GATED = { lines: 90, functions: 90, branches: 85, statements: 90 };

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
    exclude: [
      "**/node_modules/**",
      "src/**/*.db.test.ts",
      "e2e/**",
      // Copies de travail des agents (worktrees) : pas ce dépôt.
      ".claude/**",
    ],
    coverage: {
      provider: "v8",
      // `json` (coverage-final.json) sert aussi à fallow, pour des scores de
      // risque exacts au lieu d'estimations.
      reporter: ["text", "html", "lcov", "json"],
      // Mesurée sur tout le code (pour fallow), mais bloquante seulement sur le
      // domaine pur, les dépôts et les utilitaires (voir `thresholds`). Les
      // écrans sont testés sans seuil (effets visuels peu testables).
      include: ["src/**/*.{ts,tsx}", "scripts/**/*.{ts,mts,mjs}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.db.test.ts",
        "**/*.d.ts",
        "src/generated/**",
        "src/test/**",
      ],
      // Seuils par zone : les couches d'entrée-sortie (Postgres, session,
      // notifications) n'y figurent pas, elles sont vérifiées par `pnpm test:db`
      // et en conditions réelles.
      thresholds: {
        "src/domain/**/*.ts": GATED,
        "src/data/{catalog,mock,player}/**/*.ts": GATED,
        "src/data/repositories.ts": GATED,
        "src/data/server/{rows,notification-state}.ts": GATED,
        "src/lib/{dates,duration,rng,utils,rate-limit,security-headers}.ts":
          GATED,
        "src/lib/sentry/**/*.ts": GATED,
        "src/lib/supabase/routes.ts": GATED,
        "scripts/import-clubs/{parse,colors,assemble}.ts": GATED,
      },
    },
  },
});
