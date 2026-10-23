import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // CLAUDE.md : typage fort, zéro `any`.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
  {
    // CLAUDE.md : une feature n'en importe une autre que par son index.ts.
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              // Seule exception : le point d'entrée serveur d'une feature (code réservé au serveur).
              group: ["@/features/*/*", "!@/features/*/server"],
              message:
                "Importer une feature par son index.ts (@/features/<feature>).",
            },
            {
              group: ["@/data/mock", "@/data/mock/*"],
              message:
                "Passer par @/data : l'UI ne connaît que les interfaces de dépôt.",
            },
          ],
        },
      ],
    },
  },
  {
    // CLAUDE.md : le domaine est pur — ni React, ni Next, ni accès aux données.
    // (Ce bloc remplace le précédent pour src/domain : en flat config, la dernière règle gagne.)
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "react",
                "react-dom",
                "next",
                "next/*",
                "@/data",
                "@/data/*",
                "@/features/*",
                "@/app/*",
              ],
              message:
                "src/domain doit rester pur (aucune dépendance UI ou I/O).",
            },
          ],
        },
      ],
    },
  },
  {
    // La couche data est la seule à connaître ses implémentations.
    files: ["src/data/**/*.ts"],
    rules: { "no-restricted-imports": "off" },
  },
  // Désactive les règles de style en conflit avec Prettier (doit rester en dernier).
  prettier,
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "coverage/**",
    // Client Prisma généré (non versionné).
    "src/generated/**",
    "next-env.d.ts",
    "public/sw.js",
  ]),
]);

export default eslintConfig;
