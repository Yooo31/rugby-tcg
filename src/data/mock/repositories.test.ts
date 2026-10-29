import { z } from "zod";
import {
  BOOSTER_SIZE,
  BoosterQuotaExceededError,
  clubSchema,
  CosmeticUnavailableError,
  DEFAULT_COSMETICS,
  DEFAULT_EQUIPPED,
  PLAYABLE_DIVISIONS,
  MAX_FREE_BOOSTERS,
  InsufficientIngotsError,
  RewardNotClaimableError,
} from "@/domain";
import { createSeededRng } from "@/lib/rng";
import { makeClubs } from "@/test/fixtures";
import { CLUB_CATALOG } from "../catalog";
import { createMockRepositories } from "./repositories";
import { createMemoryStore, readJson } from "./storage";

function setup(
  options: Partial<Parameters<typeof createMockRepositories>[0]> = {},
) {
  const store = createMemoryStore();
  let current = new Date("2026-10-13T09:00:00");
  const { player, clubs, albums } = createMockRepositories({
    store,
    rng: createSeededRng(1),
    now: () => current,
    ...options,
  });
  return {
    store,
    player,
    clubs,
    albums,
    setNow: (value: string) => {
      current = new Date(value);
    },
  };
}

describe("catalogue des clubs", () => {
  it("contient des clubs valides aux identifiants uniques", () => {
    expect(CLUB_CATALOG.length).toBeGreaterThan(100);
    expect(new Set(CLUB_CATALOG.map((club) => club.id)).size).toBe(
      CLUB_CATALOG.length,
    );
    for (const club of CLUB_CATALOG)
      expect(clubSchema.safeParse(club).success).toBe(true);
  });

  it("couvre toutes les divisions jouables", () => {
    expect(new Set(CLUB_CATALOG.map((club) => club.division)).size).toBe(
      PLAYABLE_DIVISIONS.length,
    );
  });
});

describe("catalogue", () => {
  it("expose les clubs et les albums", async () => {
    const { clubs, albums } = setup();
    expect(await clubs.list()).toHaveLength(CLUB_CATALOG.length);
    expect((await albums.list()).map((album) => album.id)).toContain(
      "departement-31",
    );
  });
});

describe("boosters", () => {
  it("donne à un nouveau joueur une réserve pleine, aucune carte et aucun lingot", async () => {
    const { player } = setup();
    expect(await player.get()).toMatchObject({
      collection: [],
      ingots: 0,
      boosters: { free: MAX_FREE_BOOSTERS, bonus: 0, nextFreeAt: null },
      claimedAlbumIds: [],
    });
  });

  it("ouvre un booster, range les cartes et décompte le quota", async () => {
    const { player } = setup();
    const opening = await player.openBooster();

    expect(opening.cards).toHaveLength(BOOSTER_SIZE);
    expect(opening.player.boosters).toMatchObject({
      free: MAX_FREE_BOOSTERS - 1,
      bonus: 0,
    });
    expect(await player.get()).toEqual(opening.player);
  });

  it("bloque quand la réserve est vide, puis rend un booster 4 heures plus tard", async () => {
    const { player, setNow } = setup();
    for (let opening = 0; opening < MAX_FREE_BOOSTERS; opening += 1)
      await player.openBooster();

    await expect(player.openBooster()).rejects.toBeInstanceOf(
      BoosterQuotaExceededError,
    );
    const { collection, boosters } = await player.get();
    expect(boosters.nextFreeAt).toBe(new Date("2026-10-13T13:00:00").getTime());

    setNow("2026-10-13T12:59:59");
    expect((await player.get()).boosters.free).toBe(0);

    setNow("2026-10-13T13:00:00");
    const later = await player.get();
    expect(later.boosters.free).toBe(1);
    expect(later.collection).toEqual(collection);
  });

  it("repart d'un état vierge si le stockage est corrompu", async () => {
    const { player, store } = setup();
    store.setItem("rugby-tcg:collection", "{pas du json");
    store.setItem("rugby-tcg:wallet", JSON.stringify({ ingots: -5 }));
    expect(await player.get()).toMatchObject({ collection: [], ingots: 0 });
  });
});

describe("missions", () => {
  it("avance à chaque ouverture, se récupère une seule fois et crédite les lingots", async () => {
    const { player } = setup();
    for (let opening = 0; opening < MAX_FREE_BOOSTERS; opening += 1)
      await player.openBooster();

    const { missions } = await player.get();
    const done = missions.find((entry) => entry.status === "claimable");
    if (!done)
      throw new Error(
        "Aucune mission terminée après 3 boosters : revoir le vivier.",
      );

    const after = await player.claimMission(done.mission.id);
    expect(after.ingots).toBe(done.mission.reward.ingots);
    expect(
      after.missions.find((entry) => entry.mission.id === done.mission.id)
        ?.status,
    ).toBe("claimed");

    await expect(player.claimMission(done.mission.id)).rejects.toBeInstanceOf(
      RewardNotClaimableError,
    );
    expect((await player.get()).ingots).toBe(done.mission.reward.ingots);
  });

  it("refuse une mission qui n'est pas terminée", async () => {
    const { player } = setup();
    const [{ mission }] = (await player.get()).missions;
    await expect(player.claimMission(mission.id)).rejects.toBeInstanceOf(
      RewardNotClaimableError,
    );
  });

  it("repart de zéro le lendemain", async () => {
    const { player, setNow } = setup();
    await player.openBooster();
    setNow("2026-10-14T08:00:00");
    const { missions } = await player.get();
    expect(
      missions.every(
        (entry) => entry.progress === 0 && entry.status === "locked",
      ),
    ).toBe(true);
  });
});

describe("récompenses d'album", () => {
  // 5 clubs, tous du même département : un seul booster termine tous les albums.
  const tinyLeague = { clubs: makeClubs(5) };

  it("récompense un album terminé, une seule fois", async () => {
    const { player } = setup(tinyLeague);
    await player.openBooster();

    const after = await player.claimAlbumReward("france");
    expect(after.claimedAlbumIds).toEqual(["france"]);
    expect(after.ingots).toBe(25);

    await expect(player.claimAlbumReward("france")).rejects.toBeInstanceOf(
      RewardNotClaimableError,
    );
  });

  it("refuse un album incomplet ou inconnu", async () => {
    const { player } = setup();
    await player.openBooster();
    await expect(player.claimAlbumReward("france")).rejects.toBeInstanceOf(
      RewardNotClaimableError,
    );
    await expect(player.claimAlbumReward("inconnu")).rejects.toBeInstanceOf(
      RewardNotClaimableError,
    );
  });
});

describe("boutique", () => {
  const withIngots = (
    store: ReturnType<typeof setup>["store"],
    ingots: number,
  ) =>
    store.setItem(
      "rugby-tcg:wallet",
      JSON.stringify({ ingots, bonusBoosters: 0 }),
    );

  it("refuse un achat sans lingots", async () => {
    const { player } = setup();
    await expect(player.buyBoosters("single")).rejects.toBeInstanceOf(
      InsufficientIngotsError,
    );
  });

  it("vend le lot de 10 boosters pour 900 lingots", async () => {
    const { player, store } = setup();
    withIngots(store, 1000);
    expect(await player.buyBoosters("pack")).toMatchObject({
      ingots: 100,
      boosters: { free: MAX_FREE_BOOSTERS, bonus: 10 },
    });
  });

  it("vend un booster bonus, utilisable une fois la réserve vide", async () => {
    const { player, store } = setup();
    withIngots(store, 100);
    expect(await player.buyBoosters("single")).toMatchObject({
      ingots: 0,
      boosters: { bonus: 1 },
    });

    for (let opening = 0; opening < MAX_FREE_BOOSTERS; opening += 1)
      await player.openBooster();
    const { player: afterBonus } = await player.openBooster();
    expect(afterBonus.boosters).toMatchObject({ free: 0, bonus: 0 });
    await expect(player.openBooster()).rejects.toBeInstanceOf(
      BoosterQuotaExceededError,
    );
  });
});

describe("readJson", () => {
  it("renvoie la valeur de repli quand la clé est absente", () => {
    expect(readJson(createMemoryStore(), "absente", z.number(), 7)).toBe(7);
  });
});

describe("série de connexion", () => {
  it("se récupère une fois par jour et continue le lendemain", async () => {
    const { player, setNow } = setup();
    const first = await player.claimStreak();
    expect(first.ingots).toBe(10);
    expect(first.streak).toMatchObject({ day: 1, status: "claimed" });
    await expect(player.claimStreak()).rejects.toBeInstanceOf(
      RewardNotClaimableError,
    );

    setNow("2026-10-14T09:00:00");
    expect((await player.claimStreak()).ingots).toBe(30);
  });
});

describe("cosmétiques", () => {
  const withWallet = (store: ReturnType<typeof setup>["store"]) =>
    store.setItem(
      "rugby-tcg:wallet",
      JSON.stringify({ ingots: 300, bonusBoosters: 0 }),
    );

  it("équipe d'abord ceux de départ, toujours possédés", async () => {
    const { player } = setup();
    const { cosmetics } = await player.get();
    expect(cosmetics.equipped).toEqual(DEFAULT_EQUIPPED);
    expect(cosmetics.owned).toEqual(Object.values(DEFAULT_COSMETICS));
  });

  it("achète un dos en lingots, l'équipe et le garde", async () => {
    const { player, store } = setup();
    withWallet(store);
    await expect(player.equipCosmetic("back-night")).rejects.toBeInstanceOf(
      CosmeticUnavailableError,
    );
    const bought = await player.buyCosmetic("back-night");
    expect(bought.ingots).toBe(150);
    expect(bought.cosmetics.owned).toContain("back-night");
    await expect(player.buyCosmetic("back-night")).rejects.toBeInstanceOf(
      CosmeticUnavailableError,
    );
    await expect(player.buyCosmetic("back-leather")).rejects.toBeInstanceOf(
      InsufficientIngotsError,
    );

    const equipped = await player.equipCosmetic("back-night");
    expect(equipped.cosmetics.equipped["card-back"]).toBe("back-night");
    expect((await player.get()).cosmetics.equipped["card-back"]).toBe(
      "back-night",
    );
  });

  it("offre le dos « Tableau noir » au 30e jour de série, pour de bon", async () => {
    const { player, store, setNow } = setup();
    store.setItem(
      "rugby-tcg:streak",
      JSON.stringify({ count: 29, lastDay: "2026-10-12" }),
    );
    expect((await player.get()).cosmetics.owned).not.toContain("back-chalk");
    const claimed = await player.claimStreak();
    expect(claimed.cosmetics.owned).toContain("back-chalk");

    // La série retombe : le dos reste acquis, et s'équipe.
    setNow("2026-10-20T09:00:00");
    await player.claimStreak();
    const equipped = await player.equipCosmetic("back-chalk");
    expect(equipped.cosmetics.equipped["card-back"]).toBe("back-chalk");
  });
});

describe("divisions masquées", () => {
  it("garde une carte régionale possédée mais ne la montre plus", async () => {
    const regional = makeClubs(1, "regionale3")[0];
    const store = createMemoryStore();
    store.setItem(
      "rugby-tcg:collection",
      JSON.stringify([
        {
          clubId: regional.id,
          rarity: "common",
          count: 1,
          firstObtainedAt: "2026-10-01",
        },
      ]),
    );
    const { player } = createMockRepositories({ store });
    expect((await player.get()).collection).toEqual([]);

    await player.openBooster();
    const stored = JSON.parse(
      store.getItem("rugby-tcg:collection") ?? "[]",
    ) as { clubId: string }[];
    expect(stored.some((card) => card.clubId === regional.id)).toBe(true);
  });
});

describe("passe de saison (mock)", () => {
  const start = new Date("2026-10-13T09:00:00").getTime();
  const season = {
    id: "s1",
    title: "Saison test",
    startsAt: start - 1000,
    endsAt: start + 30 * 24 * 60 * 60 * 1000,
  };

  it("gagne des points en ouvrant un booster, refuse un palier non atteint", async () => {
    const repositories = createMockRepositories({
      store: createMemoryStore(),
      now: () => new Date(start),
      season,
    });
    const opening = await repositories.player.openBooster();
    expect(opening.player.season).toMatchObject({ xp: 10, tier: 0 });
    await expect(
      repositories.player.claimSeasonTier(1, "free"),
    ).rejects.toBeInstanceOf(RewardNotClaimableError);
  });

  it("ne compte rien hors saison", async () => {
    const repositories = createMockRepositories({
      store: createMemoryStore(),
      now: () => new Date(start),
    });
    expect((await repositories.player.openBooster()).player.season).toBeNull();
  });
});
