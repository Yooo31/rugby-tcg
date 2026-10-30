import {
  lastRefillAt,
  MAX_FREE_BOOSTERS,
  VIP_MAX_FREE_BOOSTERS,
  vipUntil,
  type NotificationKind,
  type NotificationState,
} from "@/domain";
import { toDayKey } from "@/lib/dates";

/**
 * Passage entre la ligne `players` et l'état utilisé par les règles de
 * notification. Pur, donc testé sans base (voir notifications.ts pour l'envoi).
 */

export interface NotificationRow {
  readonly reserveCount: number | null;
  readonly reserveSince: Date | null;
  readonly bonusBoosters: number;
  readonly streakCount: number;
  readonly streakLastDay: string | null;
  readonly notifiedBoosterAt: Date | null;
  readonly notifiedEveningDay: string | null;
  readonly notifiedStreakDay: string | null;
  /** Périodes de pass VIP non remboursées : la réserve d'un VIP est plus grande. */
  readonly vipMemberships: readonly { startsAt: Date; endsAt: Date }[];
}

export function notificationStateOf(
  row: NotificationRow,
  now: Date,
): NotificationState {
  const isVip =
    vipUntil(
      row.vipMemberships.map(({ startsAt, endsAt }) => ({
        startsAt: startsAt.getTime(),
        endsAt: endsAt.getTime(),
      })),
      now.getTime(),
    ) !== null;
  return {
    reserve:
      row.reserveCount === null || row.reserveSince === null
        ? null
        : { count: row.reserveCount, since: row.reserveSince.getTime() },
    maxFreeBoosters: isVip ? VIP_MAX_FREE_BOOSTERS : MAX_FREE_BOOSTERS,
    bonusBoosters: row.bonusBoosters,
    streak: { count: row.streakCount, lastDay: row.streakLastDay },
    notifiedBoosterAt: row.notifiedBoosterAt?.getTime() ?? null,
    notifiedEveningDay: row.notifiedEveningDay,
    notifiedStreakDay: row.notifiedStreakDay,
  };
}

/** Ce qu'il faut noter sur le joueur après l'envoi, pour ne pas répéter. */
export function notifiedFields(
  due: readonly NotificationKind[],
  state: NotificationState,
  now: Date,
): {
  notifiedBoosterAt?: Date;
  notifiedEveningDay?: string;
  notifiedStreakDay?: string;
} {
  const refilledAt = lastRefillAt(state, now);
  // Le rappel du soir annonce aussi les boosters regagnés jusque-là.
  const announcesBoosters =
    due.includes("booster-ready") || due.includes("evening-boosters");
  return {
    // Le marqueur n'avance que : il ne recule pas quand la réserve rétrécit
    // (fin d'un pass VIP).
    ...(announcesBoosters &&
    refilledAt !== null &&
    (state.notifiedBoosterAt === null || refilledAt > state.notifiedBoosterAt)
      ? { notifiedBoosterAt: new Date(refilledAt) }
      : {}),
    ...(due.includes("evening-boosters")
      ? { notifiedEveningDay: toDayKey(now) }
      : {}),
    ...(due.includes("streak-reminder")
      ? { notifiedStreakDay: toDayKey(now) }
      : {}),
  };
}
