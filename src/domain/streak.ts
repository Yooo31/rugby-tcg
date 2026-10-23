import { z } from "zod";
import { daysBetween } from "@/lib/dates";
import { RewardNotClaimableError, type Reward } from "./reward";

/** Lingots gagnés par jour de série : 10 le premier jour, 20 le deuxième… */
const STREAK_INGOTS_PER_DAY = 10;
/** Plafond de lingots par jour, atteint au dixième jour. */
const MAX_STREAK_INGOTS = 100;
/** Un booster en plus tous les 7 jours de série. */
const STREAK_BOOSTER_EVERY = 7;

/**
 * Série de connexion : `count` jours d'affilée récupérés, le dernier étant
 * `lastDay` (AAAA-MM-JJ, heure de Paris). Un jour manqué remet la série à 1.
 */
export const streakSchema = z.object({
  count: z.number().int().min(0),
  lastDay: z.string().nullable(),
});

export type Streak = z.infer<typeof streakSchema>;

export const EMPTY_STREAK: Streak = { count: 0, lastDay: null };

/** Récompense du jour `day` de la série (1 pour le premier). */
export function streakReward(day: number): Reward {
  return {
    ingots: Math.min(MAX_STREAK_INGOTS, day * STREAK_INGOTS_PER_DAY),
    boosters: day > 0 && day % STREAK_BOOSTER_EVERY === 0 ? 1 : 0,
  };
}

/** La série du jour, vue par le joueur. */
export interface StreakProgress {
  /** Jour de série de la récompense d'aujourd'hui. */
  readonly day: number;
  readonly reward: Reward;
  readonly status: "claimable" | "claimed";
}

/** Jour de série à récupérer aujourd'hui, ou déjà récupéré. */
export function streakProgress(streak: Streak, today: string): StreakProgress {
  if (streak.lastDay === today) {
    return {
      day: streak.count,
      reward: streakReward(streak.count),
      status: "claimed",
    };
  }
  const continues =
    streak.lastDay !== null && daysBetween(streak.lastDay, today) === 1;
  const day = continues ? streak.count + 1 : 1;
  return { day, reward: streakReward(day), status: "claimable" };
}

/** Récupère la récompense du jour ; erreur si elle l'a déjà été. */
export function claimStreak(
  streak: Streak,
  today: string,
): { readonly streak: Streak; readonly reward: Reward } {
  const progress = streakProgress(streak, today);
  if (progress.status === "claimed") throw new RewardNotClaimableError();
  return {
    streak: { count: progress.day, lastDay: today },
    reward: progress.reward,
  };
}
