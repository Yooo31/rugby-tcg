import {
  boosterReserveSchema,
  missionLogSchema,
  seasonLogSchema,
  ownedCardSchema,
  ownedSpecialCardSchema,
  streakSchema,
  walletSchema,
  type MissionLog,
  type OwnedCard,
  type SeasonLog,
} from "@/domain";
import type { PlayerRecord } from "../player/repository";

/**
 * Passage entre les lignes de la base et l'état du joueur du domaine.
 * Pur, donc testé sans base ; les requêtes vivent dans `prisma-store.ts`.
 */

export interface PlayerRow {
  readonly username: string | null;
  readonly ingots: number;
  readonly bonusBoosters: number;
  readonly reserveCount: number | null;
  readonly reserveSince: Date | null;
  readonly streakCount: number;
  readonly streakLastDay: string | null;
}

export interface OwnedCardRow {
  readonly clubId: string;
  readonly rarity: string;
  readonly count: number;
  readonly firstObtainedAt: Date;
}

export interface OwnedSpecialCardRow {
  readonly specialId: string;
  readonly count: number;
  readonly firstObtainedAt: Date;
}

export interface MissionLogRow {
  readonly day: string;
  /** Colonne JSON : validée à la lecture. */
  readonly progress: unknown;
  readonly claimed: readonly string[];
}

export interface PlayerRows {
  readonly player: PlayerRow;
  readonly ownedCards: readonly OwnedCardRow[];
  readonly ownedSpecialCards: readonly OwnedSpecialCardRow[];
  readonly missionLog: MissionLogRow | null;
  readonly claimedAlbumIds: readonly string[];
  readonly claimedGiveawayIds: readonly string[];
  readonly seasonLog: SeasonLogRow | null;
  /** Saisons dont le joueur a la voie payante. */
  readonly seasonPassIds: readonly string[];
}

export interface SeasonLogRow {
  readonly seasonId: string;
  readonly xp: number;
  readonly claimedFree: readonly number[];
  readonly claimedPremium: readonly number[];
}

/** Lignes de la base → état du joueur. Une ligne invalide est une erreur franche. */
export function recordFromRows(rows: PlayerRows): PlayerRecord {
  const { player } = rows;
  const reserve =
    player.reserveCount === null || player.reserveSince === null
      ? null
      : boosterReserveSchema.parse({
          count: player.reserveCount,
          since: player.reserveSince.getTime(),
        });

  // Un journal illisible ne doit pas bloquer le joueur : il repart du jour vierge.
  const missions = rows.missionLog
    ? (missionLogSchema.safeParse({
        day: rows.missionLog.day,
        progress: rows.missionLog.progress,
        claimed: rows.missionLog.claimed,
      }).data ?? null)
    : null;

  return {
    username: player.username,
    collection: rows.ownedCards.map((card) =>
      ownedCardSchema.parse({
        clubId: card.clubId,
        rarity: card.rarity,
        count: card.count,
        firstObtainedAt: card.firstObtainedAt.toISOString(),
      }),
    ),
    specialCards: rows.ownedSpecialCards.map((card) =>
      ownedSpecialCardSchema.parse({
        id: card.specialId,
        count: card.count,
        firstObtainedAt: card.firstObtainedAt.toISOString(),
      }),
    ),
    reserve,
    wallet: walletSchema.parse({
      ingots: player.ingots,
      bonusBoosters: player.bonusBoosters,
    }),
    missions,
    claimedAlbumIds: [...rows.claimedAlbumIds],
    claimedGiveawayIds: [...rows.claimedGiveawayIds],
    streak: streakSchema.parse({
      count: player.streakCount,
      lastDay: player.streakLastDay,
    }),
    season: rows.seasonLog
      ? seasonLogSchema.parse({
          seasonId: rows.seasonLog.seasonId,
          xp: rows.seasonLog.xp,
          claimedFree: [...rows.seasonLog.claimedFree],
          claimedPremium: [...rows.seasonLog.claimedPremium],
        })
      : null,
    seasonPasses: [...rows.seasonPassIds],
  };
}

/** Écritures à faire pour passer de l'état `before` à l'état `after`. */
export interface PlayerWrites {
  /** Nouvelles valeurs de la ligne `players`, ou `null` si rien n'a changé. */
  readonly player: PlayerRow | null;
  /** Cartes nouvelles ou dont le nombre d'exemplaires a changé. */
  readonly cards: readonly OwnedCardRow[];
  /** Cartes spéciales nouvelles ou dont le nombre d'exemplaires a changé. */
  readonly specialCards: readonly OwnedSpecialCardRow[];
  readonly missionLog: MissionLog | null;
  /** Avancement de saison à réécrire, ou `null` s'il n'a pas changé. */
  readonly seasonLog: SeasonLog | null;
  readonly newClaimedAlbumIds: readonly string[];
  readonly newClaimedGiveawayIds: readonly string[];
}

const cardKey = (card: Pick<OwnedCard, "clubId" | "rarity">) =>
  `${card.clubId}:${card.rarity}`;

function toPlayerRow(record: PlayerRecord): PlayerRow {
  return {
    username: record.username,
    ingots: record.wallet.ingots,
    bonusBoosters: record.wallet.bonusBoosters,
    reserveCount: record.reserve?.count ?? null,
    reserveSince: record.reserve ? new Date(record.reserve.since) : null,
    streakCount: record.streak.count,
    streakLastDay: record.streak.lastDay,
  };
}

const samePlayerRow = (a: PlayerRow, b: PlayerRow) =>
  a.username === b.username &&
  a.ingots === b.ingots &&
  a.bonusBoosters === b.bonusBoosters &&
  a.reserveCount === b.reserveCount &&
  a.streakCount === b.streakCount &&
  a.streakLastDay === b.streakLastDay &&
  a.reserveSince?.getTime() === b.reserveSince?.getTime();

/**
 * Ne réécrit que ce qui a changé. Le domaine n'enlève jamais une carte ni un
 * album récupéré : seuls des ajouts et des mises à jour sont prévus.
 */
export function recordChanges(
  before: PlayerRecord,
  after: PlayerRecord,
): PlayerWrites {
  const playerBefore = toPlayerRow(before);
  const playerAfter = toPlayerRow(after);

  const countsBefore = new Map(
    before.collection.map((card) => [cardKey(card), card.count]),
  );
  const cards = after.collection
    .filter((card) => countsBefore.get(cardKey(card)) !== card.count)
    .map((card) => ({
      clubId: card.clubId,
      rarity: card.rarity,
      count: card.count,
      firstObtainedAt: new Date(card.firstObtainedAt),
    }));

  const specialBefore = new Map(
    before.specialCards.map((card) => [card.id, card.count]),
  );
  const specialCards = after.specialCards
    .filter((card) => specialBefore.get(card.id) !== card.count)
    .map((card) => ({
      specialId: card.id,
      count: card.count,
      firstObtainedAt: new Date(card.firstObtainedAt),
    }));

  const missionsChanged =
    JSON.stringify(before.missions) !== JSON.stringify(after.missions);

  const claimedBefore = new Set(before.claimedAlbumIds);
  const giveawaysBefore = new Set(before.claimedGiveawayIds);

  return {
    player: samePlayerRow(playerBefore, playerAfter) ? null : playerAfter,
    cards,
    specialCards,
    missionLog: missionsChanged ? after.missions : null,
    seasonLog:
      JSON.stringify(before.season) !== JSON.stringify(after.season)
        ? after.season
        : null,
    newClaimedAlbumIds: after.claimedAlbumIds.filter(
      (albumId) => !claimedBefore.has(albumId),
    ),
    newClaimedGiveawayIds: after.claimedGiveawayIds.filter(
      (giveawayId) => !giveawaysBefore.has(giveawayId),
    ),
  };
}
