import {
  addCards,
  addSpecialCard,
  albumProgress,
  albumReward,
  albumRewardStatus,
  boosterStock,
  buyBoosters,
  buyCosmetic,
  DEFAULT_EQUIPPED,
  equipCosmetic,
  ownedCosmeticIds,
  withEarnedCosmetics,
  claimGiveaway,
  claimMission,
  claimSeasonTier,
  claimStreak,
  drawBooster,
  drawVipBooster,
  EMPTY_STREAK,
  EMPTY_WALLET,
  gainSeasonXp,
  giveawayProgress,
  grantReward,
  MAX_FREE_BOOSTERS,
  missionLogFor,
  missionProgress,
  ownedClubIds,
  recordOpening,
  rollSpecialCard,
  RewardNotClaimableError,
  SEASON_XP_PER_BOOSTER,
  SEASON_XP_PER_MISSION,
  seasonProgress,
  spendBooster,
  streakProgress,
  usernameSchema,
  takeVipBooster,
  VIP_MAX_FREE_BOOSTERS,
  vipStatus,
  vipUntil,
  type VipMembership,
  type Adjustment,
  type Album,
  type BoosterReserve,
  type Card,
  type Club,
  type Collection,
  type CosmeticId,
  type EquippedCosmetics,
  type Giveaway,
  type IngotPackId,
  type MissionLog,
  type PlayerSnapshot,
  type Promotion,
  type Season,
  type SeasonLog,
  type SpecialCollection,
  type Streak,
  type Wallet,
} from "@/domain";
import { toDayKey } from "@/lib/dates";
import type { Rng } from "@/lib/rng";
import type { BoosterOpening, PlayerRepository } from "../repositories";

/** État brut du joueur, tel qu'un stockage le conserve. */
export interface PlayerRecord {
  readonly username: string | null;
  readonly collection: Collection;
  readonly specialCards: SpecialCollection;
  readonly reserve: BoosterReserve | null;
  readonly wallet: Wallet;
  /** Journal du dernier jour joué ; `null` si le joueur n'a jamais ouvert de booster. */
  readonly missions: MissionLog | null;
  readonly claimedAlbumIds: readonly string[];
  readonly claimedGiveawayIds: readonly string[];
  readonly streak: Streak;
  /** Avancement dans la dernière saison jouée ; `null` si jamais joué. */
  readonly season: SeasonLog | null;
  /** Saisons dont le joueur a la voie payante. */
  readonly seasonPasses: readonly string[];
  /** Cosmétiques achetés ou gagnés, hors ceux de départ. */
  readonly ownedCosmetics: readonly CosmeticId[];
  readonly equippedCosmetics: EquippedCosmetics;
  /** Périodes de pass VIP, passées comprises. */
  readonly vipMemberships: readonly VipMembership[];
  /** Dernier booster VIP ouvert (ms Unix) : le suivant 48 h plus tard. */
  readonly vipBoosterAt: number | null;
}

/**
 * Range les cosmétiques que le joueur vient de gagner (série, album terminé).
 * Ils restent acquis ensuite, même si la série retombe.
 */
function grantEarnedCosmetics(record: PlayerRecord): PlayerRecord {
  const ownedCosmetics = withEarnedCosmetics(record.ownedCosmetics, {
    streakDays: record.streak.count,
    completedAlbums: record.claimedAlbumIds.length,
  });
  return ownedCosmetics === record.ownedCosmetics
    ? record
    : { ...record, ownedCosmetics };
}

export const EMPTY_PLAYER_RECORD: PlayerRecord = {
  username: null,
  collection: [],
  specialCards: [],
  reserve: null,
  wallet: EMPTY_WALLET,
  missions: null,
  claimedAlbumIds: [],
  claimedGiveawayIds: [],
  streak: EMPTY_STREAK,
  ownedCosmetics: [],
  equippedCosmetics: DEFAULT_EQUIPPED,
  season: null,
  seasonPasses: [],
  vipMemberships: [],
  vipBoosterAt: null,
};

/** Le joueur est-il VIP à cet instant ? */
function isVipAt(record: PlayerRecord, at: Date): boolean {
  return vipUntil(record.vipMemberships, at.getTime()) !== null;
}

/** Le joueur a-t-il la voie payante de la saison en cours ? */
function hasSeasonPass(record: PlayerRecord, season: Season | null): boolean {
  return season !== null && record.seasonPasses.includes(season.id);
}

/** Fait à consigner dans un journal, en plus du nouvel état (statistiques). */
export type PlayerEvent =
  | {
      readonly type: "booster-opened";
      readonly source: "free" | "bonus" | "vip";
      readonly cards: readonly Card[];
    }
  | {
      /** Paquet de lingots payé (crédité par le serveur de paiement). */
      readonly type: "ingots-purchased";
      readonly packId: IngotPackId;
      readonly ingots: number;
      readonly priceCents: number;
      /** Identifiant du paiement chez le prestataire : un paiement, un crédit. */
      readonly reference: string;
    }
  | {
      /** Période de pass VIP, achetée (`purchase`) ou offerte (`grantedBy`). */
      readonly type: "vip-granted";
      readonly membership: VipMembership;
      readonly purchase?: {
        readonly offerId: string;
        readonly priceCents: number;
        /** Identifiant du paiement chez le prestataire : un paiement, une période. */
        readonly reference: string;
      };
      readonly grantedBy?: string;
    }
  | {
      readonly type: "admin-adjusted";
      readonly adminEmail: string;
      readonly adjustment: Adjustment;
    };

/** Ce qu'une action renvoie : l'état à enregistrer et la réponse au joueur. */
export interface RecordChange<T> {
  readonly record: PlayerRecord;
  readonly result: T;
  readonly events?: readonly PlayerEvent[];
}

/**
 * Où vit l'état d'un joueur (navigateur pour le mock, Postgres en vrai).
 * `update` doit être atomique : personne d'autre ne modifie le joueur entre la
 * lecture et l'écriture, sans quoi deux clics simultanés dépenseraient deux
 * fois le même booster.
 */
export interface PlayerStore {
  read(): Promise<PlayerRecord>;
  update<T>(change: (record: PlayerRecord) => RecordChange<T>): Promise<T>;
}

interface PlayerRepositoryDependencies {
  readonly store: PlayerStore;
  readonly clubs: readonly Club[];
  readonly albums: readonly Album[];
  readonly rng: Rng;
  readonly now: () => Date;
  /** Taille de la réserve gratuite du joueur (plus grande pour le premium). */
  readonly maxFreeBoosters?: number;
  /** Cadeaux en cours ou à venir (lus à chaque action, ils changent sans redéploiement). */
  readonly giveaways?: () => Promise<readonly Giveaway[]>;
  /** Saison en cours, s'il y en a une (programmée dans l'administration). */
  readonly season?: () => Promise<Season | null>;
  /** Promotion en cours sur les achats en euros, s'il y en a une. */
  readonly promotion?: () => Promise<Promotion | null>;
}

/** Ce qu'une action lit une fois au départ : l'heure, les cadeaux, la saison. */
interface ActionContext {
  readonly at: Date;
  readonly giveaways: readonly Giveaway[];
  readonly season: Season | null;
  readonly promotion: Promotion | null;
}

/**
 * Règles du jeu appliquées à l'état d'un joueur. Le mock et le serveur les
 * partagent : seul le stockage change, jamais l'arbitrage.
 */
export function createPlayerRepository({
  store,
  clubs,
  albums,
  rng,
  now,
  maxFreeBoosters = MAX_FREE_BOOSTERS,
  giveaways = async () => [],
  season = async () => null,
  promotion = async () => null,
}: PlayerRepositoryDependencies): PlayerRepository {
  const clubsById = new Map(clubs.map((club) => [club.id, club]));

  /** Taille de la réserve gratuite : plus grande pour un VIP. */
  const reserveSize = (record: PlayerRecord, at: Date) =>
    isVipAt(record, at)
      ? Math.max(maxFreeBoosters, VIP_MAX_FREE_BOOSTERS)
      : maxFreeBoosters;

  const loadContext = async (): Promise<ActionContext> => {
    const [currentGiveaways, currentSeason, currentPromotion] =
      await Promise.all([giveaways(), season(), promotion()]);
    return {
      at: now(),
      giveaways: currentGiveaways,
      season: currentSeason,
      promotion: currentPromotion,
    };
  };

  const toSnapshot = (
    record: PlayerRecord,
    {
      at,
      giveaways: currentGiveaways,
      season: currentSeason,
      promotion: currentPromotion,
    }: ActionContext,
  ): PlayerSnapshot => ({
    username: record.username,
    // Une carte d'une division masquée reste en base, mais hors du jeu.
    collection: record.collection.filter((card) => clubsById.has(card.clubId)),
    specialCards: record.specialCards,
    ingots: record.wallet.ingots,
    boosters: boosterStock(
      record.reserve,
      record.wallet,
      at.getTime(),
      reserveSize(record, at),
    ),
    missions: missionProgress(
      missionLogFor(record.missions, toDayKey(at)),
      isVipAt(record, at),
    ),
    claimedAlbumIds: record.claimedAlbumIds,
    giveaways: giveawayProgress(
      currentGiveaways,
      record.claimedGiveawayIds,
      at.getTime(),
    ),
    streak: streakProgress(record.streak, toDayKey(at)),
    cosmetics: {
      owned: ownedCosmeticIds(grantEarnedCosmetics(record).ownedCosmetics),
      equipped: record.equippedCosmetics,
    },
    season: seasonProgress(
      currentSeason,
      record.season,
      hasSeasonPass(record, currentSeason),
      at.getTime(),
    ),
    vip: vipStatus(record.vipMemberships, record.vipBoosterAt, at.getTime()),
    promotion: currentPromotion,
  });

  /** Applique `change` à l'état du joueur, l'enregistre et renvoie le nouvel état. */
  const update = async (
    change: (record: PlayerRecord, context: ActionContext) => PlayerRecord,
  ): Promise<PlayerSnapshot> => {
    const context = await loadContext();
    return store.update((record) => {
      // Avant l'action (un cosmétique gagné peut être équipé aussitôt) et
      // après (la série ou l'album qui vient d'être récupéré).
      const next = grantEarnedCosmetics(
        change(grantEarnedCosmetics(record), context),
      );
      return { record: next, result: toSnapshot(next, context) };
    });
  };

  /**
   * Ouvre un booster : `take` dépense le booster (gratuit, bonus ou VIP) et
   * tire ses cartes ; le reste (collection, missions, saison, carte
   * spéciale) est commun à tous les boosters.
   */
  const openWith = async (
    take: (
      record: PlayerRecord,
      at: Date,
    ) => {
      readonly record: PlayerRecord;
      readonly source: "free" | "bonus" | "vip";
      readonly cards: Card[];
    },
  ): Promise<BoosterOpening> => {
    const context = await loadContext();
    const openedAt = context.at;
    return store.update<BoosterOpening>((stored) => {
      // Comme les autres actions : un cosmétique gagné est enregistré.
      const taken = take(grantEarnedCosmetics(stored), openedAt);
      const record = taken.record;
      const { collection, pulled } = addCards(
        record.collection,
        taken.cards,
        openedAt.toISOString(),
      );
      const missions = recordOpening(
        missionLogFor(record.missions, toDayKey(openedAt)),
        pulled,
        clubsById,
        isVipAt(record, openedAt),
      );
      // Tirée après les clubs, en plus d'eux : le booster garde ses cartes.
      const specialId = rollSpecialCard(rng);
      const special = specialId
        ? addSpecialCard(record.specialCards, specialId, openedAt.toISOString())
        : null;
      const next: PlayerRecord = {
        ...record,
        collection,
        specialCards: special?.collection ?? record.specialCards,
        missions,
        season: gainSeasonXp(
          record.season,
          context.season,
          SEASON_XP_PER_BOOSTER,
          openedAt.getTime(),
        ),
      };
      return {
        record: next,
        result: {
          cards: pulled,
          special: special?.pulled ?? null,
          player: toSnapshot(next, context),
        },
        events: [
          { type: "booster-opened", source: taken.source, cards: taken.cards },
        ],
      };
    });
  };

  return {
    get: async () => {
      const [record, context] = await Promise.all([
        store.read(),
        loadContext(),
      ]);
      return toSnapshot(record, context);
    },

    openBooster: () =>
      openWith((record, at) => {
        const spending = spendBooster(
          record.reserve,
          record.wallet,
          at.getTime(),
          reserveSize(record, at),
        );
        return {
          record: {
            ...record,
            reserve: spending.reserve,
            wallet: spending.wallet,
          },
          source: spending.source,
          cards: drawBooster(clubs, rng),
        };
      }),

    openVipBooster: () =>
      openWith((record, at) => ({
        record: {
          ...record,
          vipBoosterAt: takeVipBooster(
            record.vipMemberships,
            record.vipBoosterAt,
            at.getTime(),
          ),
        },
        source: "vip",
        cards: drawVipBooster(clubs, rng),
      })),

    buyBoosters: (offerId) =>
      update((record) => ({
        ...record,
        wallet: buyBoosters(record.wallet, offerId),
      })),

    claimMission: (missionId) =>
      update((record, { at, season: currentSeason }) => {
        const { log, reward } = claimMission(
          missionLogFor(record.missions, toDayKey(at)),
          missionId,
          isVipAt(record, at),
        );
        return {
          ...record,
          missions: log,
          wallet: grantReward(record.wallet, reward),
          season: gainSeasonXp(
            record.season,
            currentSeason,
            SEASON_XP_PER_MISSION,
            at.getTime(),
          ),
        };
      }),

    claimSeasonTier: (tier, track) =>
      update((record, { at, season: currentSeason }) => {
        const claimed = claimSeasonTier(
          currentSeason,
          record.season,
          hasSeasonPass(record, currentSeason),
          tier,
          track,
          at.getTime(),
        );
        return {
          ...record,
          season: claimed.log,
          wallet: grantReward(record.wallet, claimed.reward),
        };
      }),

    claimAlbumReward: (albumId) =>
      update((record) => {
        const album = albums.find((candidate) => candidate.id === albumId);
        if (!album) throw new RewardNotClaimableError();
        const progress = albumProgress(
          album,
          clubs,
          ownedClubIds(record.collection),
        );
        const status = albumRewardStatus(
          albumId,
          progress,
          record.claimedAlbumIds,
        );
        if (status !== "claimable") throw new RewardNotClaimableError();
        return {
          ...record,
          claimedAlbumIds: [...record.claimedAlbumIds, albumId],
          wallet: grantReward(record.wallet, albumReward(progress.total)),
        };
      }),

    claimGiveaway: (giveawayId) =>
      update((record, { at, giveaways: currentGiveaways }) => {
        const reward = claimGiveaway(
          currentGiveaways,
          giveawayId,
          record.claimedGiveawayIds,
          at.getTime(),
        );
        return {
          ...record,
          claimedGiveawayIds: [...record.claimedGiveawayIds, giveawayId],
          wallet: grantReward(record.wallet, reward),
        };
      }),

    claimStreak: () =>
      update((record, { at }) => {
        const claimed = claimStreak(record.streak, toDayKey(at));
        return {
          ...record,
          streak: claimed.streak,
          wallet: grantReward(record.wallet, claimed.reward),
        };
      }),

    buyCosmetic: (cosmeticId) =>
      update((record) => {
        const bought = buyCosmetic(
          record.wallet,
          record.ownedCosmetics,
          cosmeticId,
        );
        return {
          ...record,
          wallet: bought.wallet,
          ownedCosmetics: bought.owned,
        };
      }),

    equipCosmetic: (cosmeticId) =>
      update((record) => ({
        ...record,
        equippedCosmetics: equipCosmetic(
          record.equippedCosmetics,
          record.ownedCosmetics,
          cosmeticId,
        ),
      })),

    setUsername: (username) =>
      update((record) => ({
        ...record,
        username: usernameSchema.parse(username),
      })),
  };
}
