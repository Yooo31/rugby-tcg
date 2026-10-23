import {
  BoosterQuotaExceededError,
  BOOSTER_SIZE,
  MAX_FREE_BOOSTERS,
  RewardNotClaimableError,
  UsernameTakenError,
  type PlayerSnapshot,
} from "@/domain";
import { createSeededRng } from "@/lib/rng";
import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { CATALOG_ALBUMS, CLUB_CATALOG } from "../catalog";
import { createPlayerRepository } from "../player/repository";
import { activeGiveaways } from "./giveaways";
import { createPrismaPlayerStore } from "./prisma-store";

const prisma = createTestPrisma();

beforeAll(() => seedClubs(prisma));
afterAll(() => prisma.$disconnect());

async function newPlayer(now = () => new Date("2026-10-22T09:00:00Z")) {
  const playerId = await createAuthUser(prisma);
  const repository = createPlayerRepository({
    store: createPrismaPlayerStore(prisma, playerId),
    clubs: CLUB_CATALOG,
    albums: CATALOG_ALBUMS,
    rng: createSeededRng(7),
    now,
  });
  return { playerId, repository };
}

describe("état du joueur dans Postgres", () => {
  it("crée la ligne d'un nouveau joueur à la première lecture", async () => {
    const { playerId, repository } = await newPlayer();
    expect(await repository.get()).toMatchObject({
      collection: [],
      ingots: 0,
      boosters: { free: MAX_FREE_BOOSTERS, bonus: 0 },
    });
    expect(await prisma.player.count({ where: { id: playerId } })).toBe(1);
  });

  it("enregistre les cartes, la réserve et les missions d'une ouverture", async () => {
    const { playerId, repository } = await newPlayer();
    const opening = await repository.openBooster();

    expect(opening.cards).toHaveLength(BOOSTER_SIZE);
    expect(await repository.get()).toEqual(opening.player);

    const cards = await prisma.ownedCard.findMany({ where: { playerId } });
    expect(cards.reduce((total, card) => total + card.count, 0)).toBe(
      BOOSTER_SIZE,
    );
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
    });
    expect(player.reserveCount).toBe(MAX_FREE_BOOSTERS - 1);
    expect(
      await prisma.missionLog.findUnique({ where: { playerId } }),
    ).toMatchObject({ day: "2026-10-22" });
  });

  it("ne dépense jamais deux fois le même booster, même en rafale", async () => {
    const { playerId, repository } = await newPlayer();
    const attempts = MAX_FREE_BOOSTERS + 3;
    const results = await Promise.allSettled(
      Array.from({ length: attempts }, () => repository.openBooster()),
    );

    const opened = results.filter((result) => result.status === "fulfilled");
    const refused = results.filter((result) => result.status === "rejected");
    expect(opened).toHaveLength(MAX_FREE_BOOSTERS);
    for (const result of refused)
      expect(result.reason).toBeInstanceOf(BoosterQuotaExceededError);

    const cards = await prisma.ownedCard.findMany({ where: { playerId } });
    expect(cards.reduce((total, card) => total + card.count, 0)).toBe(
      MAX_FREE_BOOSTERS * BOOSTER_SIZE,
    );
  });

  it("annule tout si l'action est refusée", async () => {
    const { playerId, repository } = await newPlayer();
    await repository.get();
    await expect(repository.buyBoosters("single")).rejects.toThrow();
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
    });
    expect(player).toMatchObject({ ingots: 0, bonusBoosters: 0 });
  });

  it("garde les récompenses récupérées d'une requête à l'autre", async () => {
    const { repository } = await newPlayer();
    for (let opening = 0; opening < MAX_FREE_BOOSTERS; opening += 1)
      await repository.openBooster();
    const done = (await repository.get()).missions.find(
      (entry) => entry.status === "claimable",
    );
    if (!done) throw new Error("Aucune mission terminée après 3 boosters.");

    await repository.claimMission(done.mission.id);
    const after = await repository.get();
    expect(after.ingots).toBe(done.mission.reward.ingots);
    expect(
      after.missions.find((entry) => entry.mission.id === done.mission.id)
        ?.status,
    ).toBe("claimed");
  });
});

describe("pseudo, cadeaux et journal", () => {
  it("refuse un pseudo déjà pris, sans tenir compte de la casse", async () => {
    const first = await newPlayer();
    const second = await newPlayer();
    const name = `Pilier${Date.now() % 100000}`;
    await first.repository.setUsername(name);
    await expect(
      second.repository.setUsername(name.toUpperCase()),
    ).rejects.toBeInstanceOf(UsernameTakenError);
    expect((await second.repository.get()).username).toBeNull();
  });

  it("consigne chaque ouverture avec sa source et ses cartes", async () => {
    const { playerId, repository } = await newPlayer();
    const opening = await repository.openBooster();
    const [logged] = await prisma.boosterOpening.findMany({
      where: { playerId },
    });
    expect(logged.source).toBe("free");
    expect(logged.cards).toEqual(
      opening.cards.map(({ clubId, rarity }) => ({ clubId, rarity })),
    );
  });

  it("donne un cadeau en cours une seule fois", async () => {
    const now = new Date("2026-10-23T10:00:00Z");
    const giveaway = await prisma.giveaway.create({
      data: {
        title: "Un booster offert",
        boosters: 1,
        startsAt: new Date("2026-10-22T22:00:00Z"),
        endsAt: new Date("2026-10-23T22:00:00Z"),
        createdBy: "admin@test.local",
      },
    });
    const playerId = await createAuthUser(prisma);
    const repository = createPlayerRepository({
      store: createPrismaPlayerStore(prisma, playerId),
      clubs: CLUB_CATALOG,
      albums: CATALOG_ALBUMS,
      rng: createSeededRng(3),
      now: () => now,
      giveaways: () => activeGiveaways(prisma, now),
    });

    // D'autres fichiers de test créent aussi des cadeaux : on suit le nôtre.
    const ours = (snapshot: PlayerSnapshot) =>
      snapshot.giveaways.find((entry) => entry.giveaway.id === giveaway.id);
    expect(ours(await repository.get())?.status).toBe("claimable");
    const after = await repository.claimGiveaway(giveaway.id);
    expect(after.boosters.bonus).toBe(1);
    expect(ours(after)?.status).toBe("claimed");
    await expect(repository.claimGiveaway(giveaway.id)).rejects.toBeInstanceOf(
      RewardNotClaimableError,
    );
  });
});
