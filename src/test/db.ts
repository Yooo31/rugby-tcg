import { randomUUID } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { CLUB_CATALOG } from "@/data/catalog";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Outils des tests d'intégration (`*.db.test.ts`) : client Prisma sur la base
 * Docker préparée par `scripts/test-db/global-setup.ts`.
 */

export function createTestPrisma(): PrismaClient {
  const connectionString = process.env["TEST_DATABASE_URL"];
  if (!connectionString)
    throw new Error("TEST_DATABASE_URL absent : lancer `pnpm test:db`.");
  return new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
}

/** Copie le catalogue dans la table `clubs`, comme `pnpm db:seed`. */
export async function seedClubs(prisma: PrismaClient): Promise<void> {
  await prisma.club.createMany({
    data: CLUB_CATALOG.map((club) => ({
      id: club.id,
      name: club.name,
      city: club.city,
      department: club.department,
      division: club.division,
      category: club.category,
      colorPrimary: club.colors.primary,
      colorSecondary: club.colors.secondary,
      recentResults: club.recentResults,
    })),
    skipDuplicates: true,
  });
}

/** Crée un utilisateur Supabase fictif et renvoie son identifiant. */
export async function createAuthUser(
  prisma: PrismaClient,
  email = `${randomUUID()}@test.local`,
): Promise<string> {
  const id = randomUUID();
  await prisma.$executeRaw`INSERT INTO auth.users (id, email) VALUES (${id}::uuid, ${email})`;
  return id;
}
