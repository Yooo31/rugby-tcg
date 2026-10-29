import type {
  Album,
  BoosterOfferId,
  Club,
  CosmeticId,
  Leaderboard,
  PlayerSnapshot,
  PulledCard,
  PulledSpecialCard,
  RegionId,
  SeasonTrack,
} from "@/domain";

/**
 * Contrats d'accès aux données. L'interface (UI) ne dépend que de ce fichier :
 * brancher Supabase revient à fournir une autre implémentation dans
 * `src/data/index.ts`, sans toucher aux features.
 */

export interface ClubRepository {
  list(): Promise<Club[]>;
}

export interface AlbumRepository {
  list(): Promise<Album[]>;
}

export interface BoosterOpening {
  readonly cards: readonly PulledCard[];
  /** Carte spéciale tirée en plus, une fois sur cent mille ; sinon `null`. */
  readonly special: PulledSpecialCard | null;
  /** État du joueur après l'ouverture (cartes rangées, missions avancées). */
  readonly player: PlayerSnapshot;
}

/**
 * Tout ce qui lit ou modifie l'état du joueur. Chaque action renvoie l'état
 * à jour : l'interface n'a jamais à le recalculer elle-même.
 */
export interface PlayerRepository {
  get(): Promise<PlayerSnapshot>;
  /**
   * Ouvre un booster (gratuit d'abord, bonus ensuite).
   * Rejette avec `BoosterQuotaExceededError` s'il n'en reste aucun.
   */
  openBooster(): Promise<BoosterOpening>;
  /** Achète une offre de boosters en lingots. Rejette avec `InsufficientIngotsError`. */
  buyBoosters(offerId: BoosterOfferId): Promise<PlayerSnapshot>;
  /** Rejette avec `RewardNotClaimableError` si la mission n'est pas terminée ou déjà prise. */
  claimMission(missionId: string): Promise<PlayerSnapshot>;
  /** Rejette avec `RewardNotClaimableError` si l'album n'est pas terminé ou déjà récompensé. */
  claimAlbumReward(albumId: string): Promise<PlayerSnapshot>;
  /** Rejette avec `RewardNotClaimableError` si le palier n'est pas atteint, ouvert ou déjà pris. */
  claimSeasonTier(tier: number, track: SeasonTrack): Promise<PlayerSnapshot>;
  /** Rejette avec `RewardNotClaimableError` si le cadeau n'est pas en cours ou déjà pris. */
  claimGiveaway(giveawayId: string): Promise<PlayerSnapshot>;
  /** Rejette avec `RewardNotClaimableError` si la série du jour est déjà récupérée. */
  claimStreak(): Promise<PlayerSnapshot>;
  /**
   * Achète un cosmétique en lingots. Rejette avec `InsufficientIngotsError`,
   * ou `CosmeticUnavailableError` s'il est déjà possédé.
   */
  buyCosmetic(cosmeticId: CosmeticId): Promise<PlayerSnapshot>;
  /** Équipe un cosmétique possédé. Rejette avec `CosmeticUnavailableError` sinon. */
  equipCosmetic(cosmeticId: CosmeticId): Promise<PlayerSnapshot>;
  /**
   * Choisit ou change le pseudo (déjà validé par `usernameSchema`).
   * Rejette avec `UsernameTakenError` s'il appartient à un autre joueur.
   */
  setUsername(username: string): Promise<PlayerSnapshot>;
}

/** Classement des collectionneurs, vu par le joueur connecté. */
export interface LeaderboardRepository {
  /** Classement général (`null`) ou limité aux clubs d'une région. */
  get(region: RegionId | null): Promise<Leaderboard>;
}

export interface Repositories {
  readonly clubs: ClubRepository;
  readonly albums: AlbumRepository;
  readonly player: PlayerRepository;
  readonly leaderboard: LeaderboardRepository;
}
