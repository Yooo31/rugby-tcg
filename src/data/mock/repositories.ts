import { z } from "zod";
import {
  boosterReserveSchema,
  buildPermanentAlbums,
  clubRegion,
  collectionSchema,
  EMPTY_STREAK,
  EMPTY_WALLET,
  missionLogSchema,
  ownedSpecialCardSchema,
  parseEquipped,
  parseOwnedCosmetics,
  rankScores,
  seasonLogSchema,
  streakSchema,
  walletSchema,
  type Club,
  type Giveaway,
  type Season,
  vipMembershipSchema,
  vipUntil,
  type VipMembership,
} from "@/domain";
import type { Rng } from "@/lib/rng";
import type { Repositories } from "../repositories";
import { CLUB_CATALOG } from "../catalog";
import {
  createPlayerRepository,
  type PlayerRecord,
  type PlayerStore,
} from "../player/repository";
import { readJson, writeJson, type KeyValueStore } from "./storage";

const KEYS = {
  username: "rugby-tcg:username",
  collection: "rugby-tcg:collection",
  specialCards: "rugby-tcg:special-cards",
  reserve: "rugby-tcg:booster-reserve",
  wallet: "rugby-tcg:wallet",
  missions: "rugby-tcg:missions",
  claimedAlbums: "rugby-tcg:claimed-albums",
  claimedGiveaways: "rugby-tcg:claimed-giveaways",
  streak: "rugby-tcg:streak",
  ownedCosmetics: "rugby-tcg:owned-cosmetics",
  equippedCosmetics: "rugby-tcg:equipped-cosmetics",
  season: "rugby-tcg:season",
  seasonPasses: "rugby-tcg:season-passes",
  vipMemberships: "rugby-tcg:vip-memberships",
  vipBoosterAt: "rugby-tcg:vip-booster-at",
} as const;

/** Équipement tel que stocké : un identifiant par sorte, validé à la lecture. */
const storedEquippedSchema = z.object({
  "card-back": z.string().nullish(),
  "card-frame": z.string().nullish(),
  "album-theme": z.string().nullish(),
});

/** Identifiant du seul joueur du mock. */
const MOCK_PLAYER_ID = "joueur-mock";

/** État du joueur dans un stockage clé-valeur. Un seul onglet : pas de verrou. */
function createKeyValuePlayerStore(store: KeyValueStore): PlayerStore {
  const read = (): PlayerRecord => ({
    username: readJson(store, KEYS.username, z.string().nullable(), null),
    collection: readJson(store, KEYS.collection, collectionSchema, []),
    specialCards: readJson(
      store,
      KEYS.specialCards,
      z.array(ownedSpecialCardSchema),
      [],
    ),
    reserve: readJson(
      store,
      KEYS.reserve,
      boosterReserveSchema.nullable(),
      null,
    ),
    wallet: readJson(store, KEYS.wallet, walletSchema, EMPTY_WALLET),
    missions: readJson(store, KEYS.missions, missionLogSchema.nullable(), null),
    claimedAlbumIds: readJson(
      store,
      KEYS.claimedAlbums,
      z.array(z.string()),
      [],
    ),
    claimedGiveawayIds: readJson(
      store,
      KEYS.claimedGiveaways,
      z.array(z.string()),
      [],
    ),
    streak: readJson(store, KEYS.streak, streakSchema, EMPTY_STREAK),
    ownedCosmetics: parseOwnedCosmetics(
      readJson(store, KEYS.ownedCosmetics, z.array(z.string()), []),
    ),
    equippedCosmetics: parseEquipped(
      readJson(store, KEYS.equippedCosmetics, storedEquippedSchema, {}),
    ),
    season: readJson(store, KEYS.season, seasonLogSchema.nullable(), null),
    seasonPasses: readJson(store, KEYS.seasonPasses, z.array(z.string()), []),
    vipMemberships: readJson(
      store,
      KEYS.vipMemberships,
      z.array(vipMembershipSchema),
      [],
    ),
    vipBoosterAt: readJson(
      store,
      KEYS.vipBoosterAt,
      z.number().nullable(),
      null,
    ),
  });

  const write = (record: PlayerRecord): void => {
    writeJson(store, KEYS.username, record.username);
    writeJson(store, KEYS.collection, record.collection);
    writeJson(store, KEYS.specialCards, record.specialCards);
    writeJson(store, KEYS.reserve, record.reserve);
    writeJson(store, KEYS.wallet, record.wallet);
    writeJson(store, KEYS.missions, record.missions);
    writeJson(store, KEYS.claimedAlbums, record.claimedAlbumIds);
    writeJson(store, KEYS.claimedGiveaways, record.claimedGiveawayIds);
    writeJson(store, KEYS.streak, record.streak);
    writeJson(store, KEYS.ownedCosmetics, record.ownedCosmetics);
    writeJson(store, KEYS.equippedCosmetics, record.equippedCosmetics);
    writeJson(store, KEYS.season, record.season);
    writeJson(store, KEYS.seasonPasses, record.seasonPasses);
    writeJson(store, KEYS.vipMemberships, record.vipMemberships);
    writeJson(store, KEYS.vipBoosterAt, record.vipBoosterAt);
  };

  return {
    read: async () => read(),
    update: async (change) => {
      const { record, result } = change(read());
      write(record);
      return result;
    },
  };
}

interface MockDependencies {
  readonly store: KeyValueStore;
  readonly clubs?: readonly Club[];
  readonly rng?: Rng;
  readonly now?: () => Date;
  readonly giveaways?: readonly Giveaway[];
  /** Saison en cours, pour les tests du passe de saison. */
  readonly season?: Season | null;
  /** Périodes de pass VIP de départ, pour les tests du VIP. */
  readonly vipMemberships?: readonly VipMembership[];
}

/**
 * Dépôts fictifs, pour les tests : clubs du catalogue, état du joueur dans un
 * stockage clé-valeur. Les règles sont celles du serveur (`createPlayerRepository`).
 */
export function createMockRepositories({
  store,
  clubs = CLUB_CATALOG,
  rng = Math.random,
  now = () => new Date(),
  giveaways = [],
  season = null,
  vipMemberships,
}: MockDependencies): Repositories {
  if (vipMemberships) writeJson(store, KEYS.vipMemberships, vipMemberships);
  const albums = buildPermanentAlbums(clubs);
  const clubsById = new Map(clubs.map((club) => [club.id, club]));
  const playerStore = createKeyValuePlayerStore(store);
  return {
    clubs: { list: async () => [...clubs] },
    albums: { list: async () => [...albums] },
    player: createPlayerRepository({
      store: playerStore,
      clubs,
      albums,
      rng,
      now,
      giveaways: async () => giveaways,
      season: async () => season,
    }),
    // Un seul joueur dans le mock : il est seul au classement, s'il a un pseudo.
    leaderboard: {
      get: async (region) => {
        const { username, collection, vipMemberships } =
          await playerStore.read();
        const isVip = vipUntil(vipMemberships, now().getTime()) !== null;
        const owned = new Set(
          collection
            .map((card) => clubsById.get(card.clubId))
            .filter((club): club is Club => Boolean(club))
            .filter((club) => !region || clubRegion(club) === region)
            .map((club) => club.id),
        );
        const scores = username
          ? [{ playerId: MOCK_PLAYER_ID, username, clubs: owned.size, isVip }]
          : [];
        return rankScores(scores, MOCK_PLAYER_ID);
      },
    },
  };
}
