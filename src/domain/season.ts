import { z } from "zod";
import {
  RewardNotClaimableError,
  type Reward,
  type RewardStatus,
} from "./reward";

/**
 * Passe de saison (voir docs/economie.md, section 3.4) : une saison programmée
 * dans l'administration, des paliers gagnés en jouant. La voie gratuite est
 * ouverte à tous ; la voie payante ajoute ses propres récompenses. Toutes les
 * récompenses sont affichées dès le départ et se récupèrent d'un geste.
 */
export const seasonSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(80),
  /** Début inclus et fin exclue, en millisecondes Unix. */
  startsAt: z.number(),
  endsAt: z.number(),
});

export type Season = z.infer<typeof seasonSchema>;

/** Nombre de paliers d'une saison. */
export const SEASON_TIERS = 30;
/** Points de saison pour passer un palier. */
export const SEASON_XP_PER_TIER = 200;
/** Points rapportés par un booster ouvert. */
export const SEASON_XP_PER_BOOSTER = 10;
/** Points rapportés par une mission récupérée. */
export const SEASON_XP_PER_MISSION = 30;

/** Lingots de chaque palier de la voie gratuite. */
const FREE_TIER_INGOTS = 25;
/** Un booster en voie gratuite tous les cinq paliers. */
const FREE_BOOSTER_EVERY = 5;
/** Lingots de chaque palier de la voie payante. */
const PREMIUM_TIER_INGOTS = 50;
/** Un booster en voie payante tous les trois paliers. */
const PREMIUM_BOOSTER_EVERY = 3;
/** Boosters du dernier palier, dans chaque voie. */
const FINAL_TIER_BOOSTERS = 3;

export type SeasonTrack = "free" | "premium";
export const seasonTrackSchema = z.enum(["free", "premium"]);

/** Récompenses d'un palier (1 à SEASON_TIERS), dans chaque voie. */
export function tierRewards(tier: number): Record<SeasonTrack, Reward> {
  const isFinal = tier === SEASON_TIERS;
  return {
    free: {
      ingots: FREE_TIER_INGOTS,
      boosters: isFinal
        ? FINAL_TIER_BOOSTERS
        : tier % FREE_BOOSTER_EVERY === 0
          ? 1
          : 0,
    },
    premium: {
      ingots: PREMIUM_TIER_INGOTS,
      boosters: isFinal
        ? FINAL_TIER_BOOSTERS
        : tier % PREMIUM_BOOSTER_EVERY === 0
          ? 1
          : 0,
    },
  };
}

/** Avancement d'un joueur dans une saison, tel qu'il est stocké. */
export const seasonLogSchema = z.object({
  seasonId: z.string(),
  xp: z.number().int().min(0),
  claimedFree: z.array(z.number().int().min(1)),
  claimedPremium: z.array(z.number().int().min(1)),
});

export type SeasonLog = z.infer<typeof seasonLogSchema>;

export function isSeasonActive(season: Season, now: number): boolean {
  return season.startsAt <= now && now < season.endsAt;
}

/** Journal de la saison en cours : celui d'une autre saison repart de zéro. */
export function seasonLogFor(log: SeasonLog | null, season: Season): SeasonLog {
  return log?.seasonId === season.id
    ? log
    : { seasonId: season.id, xp: 0, claimedFree: [], claimedPremium: [] };
}

/** Paliers atteints avec ces points (au plus SEASON_TIERS). */
export function reachedTier(xp: number): number {
  return Math.min(SEASON_TIERS, Math.floor(xp / SEASON_XP_PER_TIER));
}

/** Ajoute des points de saison (rien si la saison n'est pas en cours). */
export function gainSeasonXp(
  log: SeasonLog | null,
  season: Season | null,
  xp: number,
  now: number,
): SeasonLog | null {
  if (!season || !isSeasonActive(season, now)) return log;
  const current = seasonLogFor(log, season);
  return { ...current, xp: current.xp + xp };
}

export interface SeasonTierProgress {
  readonly tier: number;
  readonly free: { readonly reward: Reward; readonly status: RewardStatus };
  readonly premium: { readonly reward: Reward; readonly status: RewardStatus };
}

/** La saison en cours, vue par le joueur. */
export interface SeasonProgress {
  readonly season: Season;
  readonly xp: number;
  readonly tier: number;
  /** Points encore à gagner pour le palier suivant ; 0 au dernier palier. */
  readonly xpToNextTier: number;
  readonly hasPremium: boolean;
  readonly tiers: readonly SeasonTierProgress[];
}

function trackStatus(
  tier: number,
  reached: number,
  claimed: readonly number[],
  isOpen: boolean,
): RewardStatus {
  if (claimed.includes(tier)) return "claimed";
  return isOpen && tier <= reached ? "claimable" : "locked";
}

/** Avancement du joueur dans la saison en cours ; `null` hors saison. */
export function seasonProgress(
  season: Season | null,
  log: SeasonLog | null,
  hasPremium: boolean,
  now: number,
): SeasonProgress | null {
  if (!season || !isSeasonActive(season, now)) return null;
  const { xp, claimedFree, claimedPremium } = seasonLogFor(log, season);
  const tier = reachedTier(xp);
  return {
    season,
    xp,
    tier,
    xpToNextTier:
      tier >= SEASON_TIERS ? 0 : (tier + 1) * SEASON_XP_PER_TIER - xp,
    hasPremium,
    tiers: Array.from({ length: SEASON_TIERS }, (_, index) => {
      const number = index + 1;
      const rewards = tierRewards(number);
      return {
        tier: number,
        free: {
          reward: rewards.free,
          status: trackStatus(number, tier, claimedFree, true),
        },
        premium: {
          reward: rewards.premium,
          status: trackStatus(number, tier, claimedPremium, hasPremium),
        },
      };
    }),
  };
}

/** Récupère un palier d'une voie ; erreur s'il n'est pas atteint, ouvert ou déjà pris. */
export function claimSeasonTier(
  season: Season | null,
  log: SeasonLog | null,
  hasPremium: boolean,
  tier: number,
  track: SeasonTrack,
  now: number,
): { readonly log: SeasonLog; readonly reward: Reward } {
  const progress = seasonProgress(season, log, hasPremium, now);
  const entry = progress?.tiers.find((candidate) => candidate.tier === tier);
  if (!season || !entry || entry[track].status !== "claimable")
    throw new RewardNotClaimableError();
  const current = seasonLogFor(log, season);
  return {
    log:
      track === "free"
        ? { ...current, claimedFree: [...current.claimedFree, tier] }
        : { ...current, claimedPremium: [...current.claimedPremium, tier] },
    reward: entry[track].reward,
  };
}
