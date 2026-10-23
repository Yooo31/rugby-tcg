import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { CLUB_CATALOG } from "../catalog";
import { deleteAccount, exportAccount } from "./account";
import { ensurePlayerRow } from "./prisma-store";

const prisma = createTestPrisma();
beforeAll(() => seedClubs(prisma));
afterAll(() => prisma.$disconnect());

describe("compte (RGPD)", () => {
  it("exporte les données du joueur, sans l'adresse de l'administrateur", async () => {
    const id = await createAuthUser(prisma, `export-${Date.now()}@club.fr`);
    await ensurePlayerRow(prisma, id);
    await prisma.ownedCard.create({
      data: { playerId: id, clubId: CLUB_CATALOG[0].id, rarity: "rare" },
    });
    await prisma.adminAdjustment.create({
      data: {
        playerId: id,
        adminEmail: "admin@club.fr",
        ingotsDelta: 10,
        boostersDelta: 0,
        reason: "Geste",
      },
    });
    const data = await exportAccount(prisma, id);
    expect(data.account.email).toMatch(/^export-/);
    expect(data.player?.ownedCards).toMatchObject([{ rarity: "rare" }]);
    expect(
      JSON.stringify(data, (_key, value: unknown) =>
        typeof value === "bigint" ? String(value) : value,
      ),
    ).not.toContain("admin@club.fr");
  });

  it("supprime le compte et toutes ses données, le parrain reste", async () => {
    const referrer = await createAuthUser(prisma);
    await ensurePlayerRow(prisma, referrer);
    const id = await createAuthUser(prisma);
    await ensurePlayerRow(prisma, id);
    await prisma.player.update({
      where: { id },
      data: { referredBy: referrer },
    });
    await prisma.ownedCard.create({
      data: { playerId: id, clubId: CLUB_CATALOG[0].id, rarity: "common" },
    });

    await deleteAccount(prisma, id);
    expect(await prisma.player.count({ where: { id } })).toBe(0);
    expect(await prisma.ownedCard.count({ where: { playerId: id } })).toBe(0);
    expect(await prisma.player.count({ where: { id: referrer } })).toBe(1);
  });
});
