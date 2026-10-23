import { NegativeBalanceError } from "@/domain";
import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { CLUB_CATALOG } from "../catalog";
import {
  adjustPlayer,
  catalogStatus,
  createGiveaway,
  endGiveaway,
  gameStats,
  getPlayerDetail,
  listGiveaways,
  resetUsername,
  searchPlayers,
} from "./admin";
import { ensurePlayerRow } from "./prisma-store";

const prisma = createTestPrisma();

beforeAll(() => seedClubs(prisma));
afterAll(() => prisma.$disconnect());

async function player(username: string, email: string) {
  const id = await createAuthUser(prisma, email);
  await ensurePlayerRow(prisma, id);
  await prisma.player.update({ where: { id }, data: { username } });
  return id;
}

describe("administration", () => {
  it("cherche par pseudo ou e-mail, sans jokers SQL", async () => {
    const stamp = Date.now();
    const id = await player(
      `Ailier${stamp % 10000}`,
      `ailier-${stamp}@club.fr`,
    );

    expect(
      (await searchPlayers(prisma, `ailier-${stamp}`)).map((r) => r.id),
    ).toEqual([id]);
    expect((await searchPlayers(prisma, `AILIER${stamp % 10000}`))[0]?.id).toBe(
      id,
    );
    expect(await searchPlayers(prisma, "%_%introuvable")).toEqual([]);
  });

  it("corrige un joueur, garde la trace et refuse un solde négatif", async () => {
    const id = await player(
      `Talon${Date.now() % 10000}`,
      `talon-${Date.now()}@club.fr`,
    );
    await adjustPlayer(
      prisma,
      id,
      { ingotsDelta: 200, boostersDelta: 2, reason: "Geste commercial" },
      "admin@club.fr",
    );
    await expect(
      adjustPlayer(
        prisma,
        id,
        { ingotsDelta: -500, boostersDelta: 0, reason: "Erreur" },
        "admin@club.fr",
      ),
    ).rejects.toBeInstanceOf(NegativeBalanceError);

    const detail = await getPlayerDetail(prisma, id);
    expect(detail?.snapshot).toMatchObject({
      ingots: 200,
      boosters: { bonus: 2 },
    });
    expect(detail?.adjustments).toMatchObject([
      {
        adminEmail: "admin@club.fr",
        ingotsDelta: 200,
        reason: "Geste commercial",
      },
    ]);
  });

  it("réinitialise un pseudo", async () => {
    const id = await player(
      `Ouvreur${Date.now() % 10000}`,
      `ouvreur-${Date.now()}@club.fr`,
    );
    await resetUsername(prisma, id);
    expect((await getPlayerDetail(prisma, id))?.snapshot.username).toBeNull();
  });

  it("ne trouve pas un joueur inconnu", async () => {
    expect(
      await getPlayerDetail(prisma, "00000000-0000-0000-0000-000000000000"),
    ).toBeNull();
  });

  it("compte joueurs, ouvertures et raretés tirées", async () => {
    const id = await player(
      `Centre${Date.now() % 10000}`,
      `centre-${Date.now()}@club.fr`,
    );
    await prisma.boosterOpening.create({
      data: {
        playerId: id,
        source: "free",
        cards: [
          { clubId: CLUB_CATALOG[0].id, rarity: "legendary" },
          { clubId: CLUB_CATALOG[1].id, rarity: "common" },
        ],
      },
    });
    const stats = await gameStats(prisma, new Date());
    expect(stats.players).toBeGreaterThan(0);
    expect(stats.openings24h).toBeGreaterThan(0);
    expect(stats.activePlayers24h).toBeGreaterThan(0);
    expect(stats.drawnByRarity.legendary).toBeGreaterThan(0);
  });

  it("compare le catalogue à la base", async () => {
    const status = await catalogStatus(prisma);
    expect(status.missing).toEqual([]);
    expect(status.database).toBeGreaterThanOrEqual(status.catalog);

    await prisma.club.update({
      where: { id: CLUB_CATALOG[0].id },
      data: { name: "Nom périmé" },
    });
    expect((await catalogStatus(prisma)).outdated).toEqual([
      CLUB_CATALOG[0].id,
    ]);
    await prisma.club.update({
      where: { id: CLUB_CATALOG[0].id },
      data: { name: CLUB_CATALOG[0].name },
    });
  });

  it("crée, liste et arrête des cadeaux", async () => {
    const now = new Date("2026-10-23T12:00:00Z");
    const base = { title: "Booster offert", ingots: 0, boosters: 1 };
    await createGiveaway(
      prisma,
      {
        ...base,
        startsAt: Date.UTC(2026, 9, 22, 22),
        endsAt: Date.UTC(2026, 9, 23, 22),
      },
      "admin@club.fr",
    );
    await createGiveaway(
      prisma,
      {
        ...base,
        title: "À venir",
        startsAt: Date.UTC(2026, 10, 1),
        endsAt: Date.UTC(2026, 10, 2),
      },
      "admin@club.fr",
    );
    const listed = await listGiveaways(prisma);
    const current = listed.find((g) => g.giveaway.title === "Booster offert");
    const upcoming = listed.find((g) => g.giveaway.title === "À venir");
    if (!current || !upcoming) throw new Error("Cadeaux introuvables.");
    expect(current).toMatchObject({ claims: 0, createdBy: "admin@club.fr" });

    await endGiveaway(prisma, current.giveaway.id, now);
    await endGiveaway(prisma, upcoming.giveaway.id, now);
    const after = await listGiveaways(prisma);
    expect(
      after.find((g) => g.giveaway.id === current.giveaway.id)?.giveaway.endsAt,
    ).toBe(now.getTime());
    expect(after.some((g) => g.giveaway.id === upcoming.giveaway.id)).toBe(
      false,
    );
  });
});
