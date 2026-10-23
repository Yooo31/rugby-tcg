import { daysBetween, parisHour, toDayKey } from "@/lib/dates";
import { BOOSTER_REFILL_MS, type BoosterReserve } from "./booster";
import type { Streak } from "./streak";

/**
 * Quand prévenir un joueur, au plus deux fois par jour :
 *  - sa réserve de boosters gratuits est pleine (une fois par remplissage) ;
 *  - le soir, si sa série de connexion va se perdre à minuit.
 * Jamais la nuit : les notifications retenues partent le matin.
 */

/** Pas de notification de 22 h à 8 h, heure de Paris. */
export const QUIET_HOURS_START = 22;
export const QUIET_HOURS_END = 8;
/** Heure du rappel de série (jusqu'au début des heures calmes). */
export const STREAK_REMINDER_HOUR = 19;

export type NotificationKind = "reserve-full" | "streak-reminder";

/** Ce que le serveur sait d'un joueur abonné aux notifications. */
export interface NotificationState {
  readonly reserve: BoosterReserve | null;
  readonly maxFreeBoosters: number;
  readonly streak: Streak;
  /** Dernière notification « réserve pleine » envoyée. */
  readonly notifiedFullAt: number | null;
  /** Jour (AAAA-MM-JJ) du dernier rappel de série. */
  readonly notifiedStreakDay: string | null;
}

/** Instant où la réserve est (ou sera) pleine ; `null` si elle n'a jamais servi. */
export function reserveFullAt(
  reserve: BoosterReserve | null,
  max: number,
): number | null {
  if (!reserve) return null;
  return reserve.since + Math.max(0, max - reserve.count) * BOOSTER_REFILL_MS;
}

export function isQuietHour(now: Date): boolean {
  const hour = parisHour(now);
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

export function dueNotifications(
  state: NotificationState,
  now: Date,
): NotificationKind[] {
  if (isQuietHour(now)) return [];
  const due: NotificationKind[] = [];

  const fullAt = reserveFullAt(state.reserve, state.maxFreeBoosters);
  if (
    fullAt !== null &&
    fullAt <= now.getTime() &&
    (state.notifiedFullAt === null || state.notifiedFullAt < fullAt)
  ) {
    due.push("reserve-full");
  }

  const today = toDayKey(now);
  const streakAtRisk =
    state.streak.lastDay !== null &&
    daysBetween(state.streak.lastDay, today) === 1;
  if (
    streakAtRisk &&
    parisHour(now) >= STREAK_REMINDER_HOUR &&
    state.notifiedStreakDay !== today
  ) {
    due.push("streak-reminder");
  }
  return due;
}

export interface NotificationMessage {
  readonly title: string;
  readonly body: string;
  /** Page ouverte au clic. */
  readonly url: string;
}

export function notificationMessage(
  kind: NotificationKind,
  state: NotificationState,
): NotificationMessage {
  switch (kind) {
    case "reserve-full":
      return {
        title: `Vos ${state.maxFreeBoosters} boosters sont prêts`,
        body: "La réserve est pleine : ouvrez-les pour qu'elle se remplisse à nouveau.",
        url: "/boosters",
      };
    case "streak-reminder":
      return {
        title: `Votre série de ${state.streak.count} jours est en jeu`,
        body: "Récupérez la récompense du jour avant minuit pour la garder.",
        url: "/",
      };
  }
}
