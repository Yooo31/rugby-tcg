import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { CLUB_CATALOG } from "../catalog";
import {
  deleteAccount,
  deleteInactiveAccounts,
  exportAccount,
} from "./account";
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
    await prisma.ownedSpecialCard.create({
      data: { playerId: id, specialId: "equipe-de-france" },
    });
    await prisma.ownedCosmetic.create({
      data: { playerId: id, cosmeticId: "back-night" },
    });
    await prisma.ingotPurchase.create({
      data: {
        playerId: id,
        packId: "bag",
        ingots: 650,
        priceCents: 599,
        reference: `export-${id}`,
      },
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
    expect(data.player?.ownedSpecialCards).toMatchObject([
      { specialId: "equipe-de-france", count: 1 },
    ]);
    expect(data.player?.ownedCosmetics).toMatchObject([
      { cosmeticId: "back-night" },
    ]);
    expect(data.player?.ingotPurchases).toMatchObject([
      { packId: "bag", ingots: 650, priceCents: 599 },
    ]);
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
    await prisma.ownedSpecialCard.create({
      data: { playerId: id, specialId: "equipe-de-france" },
    });

    await deleteAccount(prisma, id);
    expect(await prisma.player.count({ where: { id } })).toBe(0);
    expect(await prisma.ownedCard.count({ where: { playerId: id } })).toBe(0);
    expect(
      await prisma.ownedSpecialCard.count({ where: { playerId: id } }),
    ).toBe(0);
    expect(await prisma.player.count({ where: { id: referrer } })).toBe(1);
  });
});

describe("comptes inactifs", () => {
  const now = new Date();
  const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
  const longAgo = new Date(now.getTime() - 3 * YEAR_MS);

  /** Compte créé il y a trois ans, avec un joueur qui n'a rien fait depuis. */
  async function oldAccount(lastSignIn: Date = longAgo): Promise<string> {
    const id = await createAuthUser(prisma);
    await prisma.$executeRaw`UPDATE auth.users SET created_at = ${longAgo}, last_sign_in_at = ${lastSignIn} WHERE id = ${id}::uuid`;
    await ensurePlayerRow(prisma, id);
    await prisma.$executeRaw`UPDATE players SET created_at = ${longAgo}, updated_at = ${longAgo} WHERE id = ${id}::uuid`;
    return id;
  }

  const exists = async (id: string) =>
    (await prisma.player.count({ where: { id } })) === 1;

  it("supprime un compte sans activité depuis deux ans, garde les autres", async () => {
    const inactive = await oldAccount();
    const recentSignIn = await oldAccount(new Date(now.getTime() - YEAR_MS));
    const recentOpening = await oldAccount();
    await prisma.boosterOpening.create({
      data: { playerId: recentOpening, source: "free", cards: [] },
    });
    const vip = await oldAccount();
    await prisma.vipMembership.create({
      data: {
        playerId: vip,
        startsAt: longAgo,
        endsAt: new Date(now.getTime() + YEAR_MS),
        grantedBy: "admin@example.com",
      },
    });

    expect(await deleteInactiveAccounts(prisma, now)).toBeGreaterThanOrEqual(1);
    expect(await exists(inactive)).toBe(false);
    expect(await exists(recentSignIn)).toBe(true);
    expect(await exists(recentOpening)).toBe(true);
    expect(await exists(vip)).toBe(true);
  });
});
