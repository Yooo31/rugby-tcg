import { SEASON_XP_PER_BOOSTER } from "@/domain";
import { createSeededRng } from "@/lib/rng";
import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { CATALOG_ALBUMS, CLUB_CATALOG } from "../catalog";
import { createPlayerRepository } from "../player/repository";
import {
  createSeason,
  endSeason,
  grantSeasonPass,
  listSeasons,
  SeasonOverlapError,
} from "./admin";
import { createPrismaPlayerStore } from "./prisma-store";
import { activeSeason } from "./seasons";

const prisma = createTestPrisma();
const DAY_MS = 24 * 60 * 60 * 1000;
// Loin dans le futur : les saisons de ce fichier ne gênent pas les autres.
const base = Date.UTC(2031, 0, 1);

beforeAll(() => seedClubs(prisma));
afterAll(() => prisma.$disconnect());

describe("saisons en base", () => {
  it("programme une saison, refuse un chevauchement, puis l'arrête", async () => {
    await createSeason(
      prisma,
      { title: "Saison A", startsAt: base, endsAt: base + 56 * DAY_MS },
      "admin@rugby-tcg.test",
    );
    await expect(
      createSeason(
        prisma,
        {
          title: "Saison B",
          startsAt: base + 10 * DAY_MS,
          endsAt: base + 70 * DAY_MS,
        },
        "admin@rugby-tcg.test",
      ),
    ).rejects.toBeInstanceOf(SeasonOverlapError);

    const during = new Date(base + DAY_MS);
    const season = await activeSeason(prisma, during);
    expect(season?.title).toBe("Saison A");
    expect(
      (await listSeasons(prisma)).find(
        (entry) => entry.season.id === season?.id,
      ),
    ).toMatchObject({ passes: 0, createdBy: "admin@rugby-tcg.test" });

    await endSeason(prisma, season!.id, during);
    expect(await activeSeason(prisma, new Date(base + 2 * DAY_MS))).toBeNull();
  });

  it("enregistre l'avancement du joueur et lui ouvre la voie payante", async () => {
    const start = base + 100 * DAY_MS;
    await createSeason(
      prisma,
      { title: "Saison C", startsAt: start, endsAt: start + 56 * DAY_MS },
      "admin@rugby-tcg.test",
    );
    const now = new Date(start + DAY_MS);
    const playerId = await createAuthUser(prisma);
    const repository = () =>
      createPlayerRepository({
        store: createPrismaPlayerStore(prisma, playerId),
        clubs: CLUB_CATALOG,
        albums: CATALOG_ALBUMS,
        rng: createSeededRng(3),
        now: () => now,
        season: () => activeSeason(prisma, now),
      });

    const opening = await repository().openBooster();
    expect(opening.player.season).toMatchObject({
      xp: SEASON_XP_PER_BOOSTER,
      hasPremium: false,
    });
    expect(
      await prisma.seasonLog.findUnique({ where: { playerId } }),
    ).toMatchObject({ xp: SEASON_XP_PER_BOOSTER });

    const season = (await activeSeason(prisma, now))!;
    await grantSeasonPass(prisma, playerId, season.id, "admin@rugby-tcg.test");
    await grantSeasonPass(prisma, playerId, season.id, "admin@rugby-tcg.test");
    expect((await repository().get()).season?.hasPremium).toBe(true);
    expect(await prisma.seasonPass.count({ where: { playerId } })).toBe(1);
  });
});
