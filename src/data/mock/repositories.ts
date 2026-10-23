import { z } from "zod";
import {
  boosterReserveSchema,
  buildPermanentAlbums,
  clubRegion,
  collectionSchema,
  EMPTY_STREAK,
  EMPTY_WALLET,
  missionLogSchema,
  rankScores,
  streakSchema,
  walletSchema,
  type Club,
  type Giveaway,
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
  reserve: "rugby-tcg:booster-reserve",
  wallet: "rugby-tcg:wallet",
  missions: "rugby-tcg:missions",
  claimedAlbums: "rugby-tcg:claimed-albums",
  claimedGiveaways: "rugby-tcg:claimed-giveaways",
  streak: "rugby-tcg:streak",
} as const;

/** Identifiant du seul joueur du mock. */
const MOCK_PLAYER_ID = "joueur-mock";

/** État du joueur dans un stockage clé-valeur. Un seul onglet : pas de verrou. */
function createKeyValuePlayerStore(store: KeyValueStore): PlayerStore {
  const read = (): PlayerRecord => ({
    username: readJson(store, KEYS.username, z.string().nullable(), null),
    collection: readJson(store, KEYS.collection, collectionSchema, []),
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
  });

  const write = (record: PlayerRecord): void => {
    writeJson(store, KEYS.username, record.username);
    writeJson(store, KEYS.collection, record.collection);
    writeJson(store, KEYS.reserve, record.reserve);
    writeJson(store, KEYS.wallet, record.wallet);
    writeJson(store, KEYS.missions, record.missions);
    writeJson(store, KEYS.claimedAlbums, record.claimedAlbumIds);
    writeJson(store, KEYS.claimedGiveaways, record.claimedGiveawayIds);
    writeJson(store, KEYS.streak, record.streak);
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
}: MockDependencies): Repositories {
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
    }),
    // Un seul joueur dans le mock : il est seul au classement, s'il a un pseudo.
    leaderboard: {
      get: async (region) => {
        const { username, collection } = await playerStore.read();
        const owned = new Set(
          collection
            .map((card) => clubsById.get(card.clubId))
            .filter((club): club is Club => Boolean(club))
            .filter((club) => !region || clubRegion(club) === region)
            .map((club) => club.id),
        );
        const scores = username
          ? [{ playerId: MOCK_PLAYER_ID, username, clubs: owned.size }]
          : [];
        return rankScores(scores, MOCK_PLAYER_ID);
      },
    },
  };
}
