import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js lit `.env.local` ; la CLI Prisma, elle, ne le fait pas toute seule.
config({ path: [".env.local", ".env"], quiet: true });

// Prisma 7 : l'application se connecte par un driver adapter (voir src/lib/db.ts,
// qui passe par le pooler DATABASE_URL). L'URL ci-dessous ne sert qu'à la CLI
// (migrations, seed) et doit être la connexion DIRECTE (DIRECT_URL).
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
