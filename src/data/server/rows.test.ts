import { ZodError } from "zod";
import { EMPTY_PLAYER_RECORD, type PlayerRecord } from "../player/repository";
import { recordChanges, recordFromRows, type PlayerRows } from "./rows";

const NEW_PLAYER: PlayerRows = {
  player: {
    username: null,
    ingots: 0,
    bonusBoosters: 0,
    reserveCount: null,
    reserveSince: null,
    streakCount: 0,
    streakLastDay: null,
    cardBack: null,
    cardFrame: null,
    albumTheme: null,
  },
  ownedCards: [],
  ownedSpecialCards: [],
  missionLog: null,
  claimedAlbumIds: [],
  claimedGiveawayIds: [],
  ownedCosmeticIds: [],
  seasonLog: null,
  seasonPassIds: [],
};

const since = new Date("2026-10-22T08:00:00Z");

const PLAYING: PlayerRows = {
  player: {
    username: "Pilier",
    ingots: 120,
    bonusBoosters: 2,
    reserveCount: 1,
    reserveSince: since,
    streakCount: 3,
    streakLastDay: "2026-10-21",
    cardBack: "back-night",
    cardFrame: null,
    albumTheme: "theme-pitch",
  },
  ownedCards: [
    { clubId: "castres", rarity: "rare", count: 2, firstObtainedAt: since },
  ],
  ownedSpecialCards: [
    { specialId: "equipe-de-france", count: 1, firstObtainedAt: since },
  ],
  missionLog: {
    day: "2026-10-22",
    progress: { "open-3": 2 },
    claimed: ["open-2"],
  },
  claimedAlbumIds: ["division-top14"],
  claimedGiveawayIds: ["cadeau-1"],
  ownedCosmeticIds: ["back-night", "theme-pitch"],
  seasonLog: { seasonId: "s1", xp: 60, claimedFree: [], claimedPremium: [] },
  seasonPassIds: ["s1"],
};

describe("recordFromRows", () => {
  it("donne un état vierge pour un nouveau joueur", () => {
    expect(recordFromRows(NEW_PLAYER)).toEqual(EMPTY_PLAYER_RECORD);
  });

  it("traduit chaque table dans l'état du domaine", () => {
    expect(recordFromRows(PLAYING)).toEqual({
      username: "Pilier",
      collection: [
        {
          clubId: "castres",
          rarity: "rare",
          count: 2,
          firstObtainedAt: since.toISOString(),
        },
      ],
      specialCards: [
        {
          id: "equipe-de-france",
          count: 1,
          firstObtainedAt: since.toISOString(),
        },
      ],
      reserve: { count: 1, since: since.getTime() },
      wallet: { ingots: 120, bonusBoosters: 2 },
      missions: {
        day: "2026-10-22",
        progress: { "open-3": 2 },
        claimed: ["open-2"],
      },
      claimedAlbumIds: ["division-top14"],
      claimedGiveawayIds: ["cadeau-1"],
      streak: { count: 3, lastDay: "2026-10-21" },
      ownedCosmetics: ["back-night", "theme-pitch"],
      equippedCosmetics: {
        "card-back": "back-night",
        "card-frame": "frame-plain",
        "album-theme": "theme-pitch",
      },
      season: {
        seasonId: "s1",
        xp: 60,
        claimedFree: [],
        claimedPremium: [],
      },
      seasonPasses: ["s1"],
    });
  });

  it("ignore un cosmétique retiré du catalogue, même équipé", () => {
    const record = recordFromRows({
      ...PLAYING,
      player: { ...PLAYING.player, cardBack: "retire" },
      ownedCosmeticIds: ["retire", "theme-pitch"],
    });
    expect(record.ownedCosmetics).toEqual(["theme-pitch"]);
    expect(record.equippedCosmetics["card-back"]).toBe("back-pitch");
  });

  it("ignore un journal de missions illisible", () => {
    const rows = {
      ...PLAYING,
      missionLog: { day: "2026-10-22", progress: "cassé", claimed: [] },
    };
    expect(recordFromRows(rows).missions).toBeNull();
  });

  it("refuse une carte d'une rareté inconnue", () => {
    const rows = {
      ...PLAYING,
      ownedCards: [{ ...PLAYING.ownedCards[0], rarity: "mythique" }],
    };
    expect(() => recordFromRows(rows)).toThrow(ZodError);
  });

  it("refuse une carte spéciale inconnue", () => {
    const rows = {
      ...PLAYING,
      ownedSpecialCards: [
        { specialId: "inconnue", count: 1, firstObtainedAt: since },
      ],
    };
    expect(() => recordFromRows(rows)).toThrow(ZodError);
  });
});

describe("recordChanges", () => {
  const before = recordFromRows(PLAYING);

  it("n'écrit rien quand rien ne change", () => {
    expect(recordChanges(before, before)).toEqual({
      player: null,
      cards: [],
      specialCards: [],
      missionLog: null,
      seasonLog: null,
      newClaimedAlbumIds: [],
      newClaimedGiveawayIds: [],
      newCosmeticIds: [],
    });
  });

  it("n'écrit que les cartes, le joueur, les missions et les albums modifiés", () => {
    const openedAt = "2026-10-22T10:00:00.000Z";
    const after: PlayerRecord = {
      username: "Pilier_31",
      collection: [
        { ...before.collection[0], count: 3 },
        {
          clubId: "albi",
          rarity: "common",
          count: 1,
          firstObtainedAt: openedAt,
        },
      ],
      specialCards: [{ ...before.specialCards[0], count: 2 }],
      reserve: { count: 0, since: since.getTime() },
      wallet: { ingots: 160, bonusBoosters: 2 },
      missions: {
        day: "2026-10-22",
        progress: { "open-3": 3 },
        claimed: ["open-2"],
      },
      claimedAlbumIds: ["division-top14", "france"],
      claimedGiveawayIds: ["cadeau-1", "cadeau-2"],
      streak: { count: 4, lastDay: "2026-10-22" },
      ownedCosmetics: [...before.ownedCosmetics, "frame-stitch"],
      equippedCosmetics: {
        ...before.equippedCosmetics,
        "card-frame": "frame-stitch",
      },
      season: { ...before.season!, xp: 70, claimedFree: [1] },
      seasonPasses: ["s1"],
    };

    expect(recordChanges(before, after)).toEqual({
      player: {
        username: "Pilier_31",
        ingots: 160,
        bonusBoosters: 2,
        reserveCount: 0,
        reserveSince: since,
        streakCount: 4,
        streakLastDay: "2026-10-22",
        cardBack: "back-night",
        cardFrame: "frame-stitch",
        albumTheme: "theme-pitch",
      },
      cards: [
        { clubId: "castres", rarity: "rare", count: 3, firstObtainedAt: since },
        {
          clubId: "albi",
          rarity: "common",
          count: 1,
          firstObtainedAt: new Date(openedAt),
        },
      ],
      specialCards: [
        { specialId: "equipe-de-france", count: 2, firstObtainedAt: since },
      ],
      missionLog: after.missions,
      seasonLog: after.season,
      newClaimedAlbumIds: ["france"],
      newClaimedGiveawayIds: ["cadeau-2"],
      newCosmeticIds: ["frame-stitch"],
    });
  });

  it("écrit la réserve entamée pour la première fois", () => {
    const after = {
      ...EMPTY_PLAYER_RECORD,
      reserve: { count: 2, since: since.getTime() },
    };
    expect(recordChanges(EMPTY_PLAYER_RECORD, after).player).toEqual({
      username: null,
      ingots: 0,
      bonusBoosters: 0,
      reserveCount: 2,
      reserveSince: since,
      streakCount: 0,
      streakLastDay: null,
      cardBack: "back-pitch",
      cardFrame: "frame-plain",
      albumTheme: "theme-night",
    });
  });
});
