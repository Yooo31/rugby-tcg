import { daysBetween, parisHour, toDayKey } from "@/lib/dates";
import { BOOSTER_REFILL_MS, type BoosterReserve } from "./booster";
import type { Streak } from "./streak";

/**
 * Quand prévenir un joueur :
 *  - à chaque booster gratuit regagné (ceux de la nuit en une seule fois, le
 *    matin) ;
 *  - à 20 h, s'il lui reste des boosters à ouvrir ;
 *  - dès 19 h, si sa série de connexion va se perdre à minuit.
 * Jamais la nuit : les notifications retenues partent le matin.
 */

/** Pas de notification de 22 h à 8 h, heure de Paris. */
const QUIET_HOURS_START = 22;
const QUIET_HOURS_END = 8;
/** Heure du rappel de série (jusqu'au début des heures calmes). */
const STREAK_REMINDER_HOUR = 19;
/** Heure du rappel des boosters non ouverts. */
const EVENING_REMINDER_HOUR = 20;

export type NotificationKind =
  "booster-ready" | "evening-boosters" | "streak-reminder";

/** Ce que le serveur sait d'un joueur abonné aux notifications. */
export interface NotificationState {
  readonly reserve: BoosterReserve | null;
  /** Taille de sa réserve gratuite (plus grande pour un VIP). */
  readonly maxFreeBoosters: number;
  /** Boosters bonus (achetés ou gagnés), hors réserve. */
  readonly bonusBoosters: number;
  readonly streak: Streak;
  /** Instant du dernier booster regagné déjà annoncé. */
  readonly notifiedBoosterAt: number | null;
  /** Jour (AAAA-MM-JJ) du dernier rappel du soir. */
  readonly notifiedEveningDay: string | null;
  /** Jour (AAAA-MM-JJ) du dernier rappel de série. */
  readonly notifiedStreakDay: string | null;
}

/**
 * Boosters gratuits regagnés depuis le dernier booster ouvert, au plus
 * jusqu'à remplir la réserve, et l'instant du dernier d'entre eux.
 */
function refills(
  reserve: BoosterReserve | null,
  max: number,
  now: number,
): { readonly free: number; readonly lastAt: number | null } {
  if (!reserve) return { free: max, lastAt: null };
  const room = Math.max(0, max - reserve.count);
  const count = Math.min(
    room,
    Math.max(0, Math.floor((now - reserve.since) / BOOSTER_REFILL_MS)),
  );
  return {
    // Une réserve gardée d'un ancien pass VIP ne compte que jusqu'au plafond.
    free: Math.min(max, reserve.count + count),
    lastAt: count > 0 ? reserve.since + count * BOOSTER_REFILL_MS : null,
  };
}

/** Instant du dernier booster gratuit regagné ; `null` s'il n'y en a pas eu. */
export function lastRefillAt(
  state: NotificationState,
  now: Date,
): number | null {
  return refills(state.reserve, state.maxFreeBoosters, now.getTime()).lastAt;
}

/** Boosters à ouvrir, gratuits et bonus. */
export function boostersToOpen(state: NotificationState, now: Date): number {
  return (
    refills(state.reserve, state.maxFreeBoosters, now.getTime()).free +
    state.bonusBoosters
  );
}

function isQuietHour(now: Date): boolean {
  const hour = parisHour(now);
  return hour >= QUIET_HOURS_START || hour < QUIET_HOURS_END;
}

export function dueNotifications(
  state: NotificationState,
  now: Date,
): NotificationKind[] {
  if (isQuietHour(now)) return [];
  const due: NotificationKind[] = [];
  const today = toDayKey(now);
  const hour = parisHour(now);

  const isEvening =
    hour >= EVENING_REMINDER_HOUR &&
    state.notifiedEveningDay !== today &&
    boostersToOpen(state, now) > 0;
  const refilledAt = lastRefillAt(state, now);
  const hasNewBooster =
    refilledAt !== null &&
    (state.notifiedBoosterAt === null || state.notifiedBoosterAt < refilledAt);
  // Le rappel du soir annonce déjà les boosters : un seul message.
  if (isEvening) due.push("evening-boosters");
  else if (hasNewBooster) due.push("booster-ready");

  const streakAtRisk =
    state.streak.lastDay !== null &&
    daysBetween(state.streak.lastDay, today) === 1;
  if (
    streakAtRisk &&
    hour >= STREAK_REMINDER_HOUR &&
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

const plural = (count: number, word: string) =>
  `${count} ${word}${count > 1 ? "s" : ""}`;

export function notificationMessage(
  kind: NotificationKind,
  state: NotificationState,
  now: Date,
): NotificationMessage {
  const free = refills(
    state.reserve,
    state.maxFreeBoosters,
    now.getTime(),
  ).free;
  switch (kind) {
    case "booster-ready":
      return free >= state.maxFreeBoosters
        ? {
            title: `Vos ${state.maxFreeBoosters} boosters sont prêts`,
            body: "La réserve est pleine : ouvrez-les pour qu'elle se remplisse à nouveau.",
            url: "/boosters",
          }
        : {
            title:
              free === 1
                ? "Un booster est prêt"
                : `${free} boosters sont prêts`,
            body: `Réserve : ${free} sur ${state.maxFreeBoosters}. Ouvrez-les avant qu'elle soit pleine.`,
            url: "/boosters",
          };
    case "evening-boosters":
      return {
        title: `Il vous reste ${plural(boostersToOpen(state, now), "booster")} à ouvrir`,
        body: "De nouveaux clubs vous attendent avant la fin de la journée.",
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
