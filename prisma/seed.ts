// Remplit la table des clubs à partir du catalogue (src/data/catalog).
// Rejouable sans risque : chaque club est créé ou mis à jour par son identifiant,
// et ceux qui ne sont plus au catalogue sont retirés s'ils ne sont possédés par personne.
// Usage : pnpm db:seed
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";
import { CLUB_CATALOG } from "../src/data/catalog";
import { PrismaClient } from "../src/generated/prisma/client";

config({ path: [".env.local", ".env"], quiet: true });

const connectionString = process.env["DIRECT_URL"];
if (!connectionString) {
  throw new Error(
    "DIRECT_URL est absent de .env.local : impossible de joindre la base.",
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  for (const club of CLUB_CATALOG) {
    const data = {
      name: club.name,
      city: club.city,
      department: club.department,
      division: club.division,
      category: club.category,
      colorPrimary: club.colors.primary,
      colorSecondary: club.colors.secondary,
      recentResults: club.recentResults,
    };
    await prisma.club.upsert({
      where: { id: club.id },
      create: { id: club.id, ...data },
      update: data,
    });
  }
  // Les clubs sortis du catalogue (relégation hors périmètre, identifiant changé)
  // sont retirés, sauf ceux qu'un joueur possède : sa carte doit rester valable.
  const { count: removed } = await prisma.club.deleteMany({
    where: {
      id: { notIn: CLUB_CATALOG.map((club) => club.id) },
      ownedCards: { none: {} },
    },
  });

  console.log(`${CLUB_CATALOG.length} clubs en base, ${removed} retirés.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
