import {
  MAX_FREE_BOOSTERS,
  reserveFullAt,
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
  readonly streakCount: number;
  readonly streakLastDay: string | null;
  readonly notifiedFullAt: Date | null;
  readonly notifiedStreakDay: string | null;
}

export function notificationStateOf(row: NotificationRow): NotificationState {
  return {
    reserve:
      row.reserveCount === null || row.reserveSince === null
        ? null
        : { count: row.reserveCount, since: row.reserveSince.getTime() },
    maxFreeBoosters: MAX_FREE_BOOSTERS,
    streak: { count: row.streakCount, lastDay: row.streakLastDay },
    notifiedFullAt: row.notifiedFullAt?.getTime() ?? null,
    notifiedStreakDay: row.notifiedStreakDay,
  };
}

/** Ce qu'il faut noter sur le joueur après l'envoi, pour ne pas répéter. */
export function notifiedFields(
  due: readonly NotificationKind[],
  state: NotificationState,
  now: Date,
): { notifiedFullAt?: Date; notifiedStreakDay?: string } {
  const fullAt = reserveFullAt(state.reserve, state.maxFreeBoosters);
  return {
    ...(due.includes("reserve-full") && fullAt !== null
      ? { notifiedFullAt: new Date(fullAt) }
      : {}),
    ...(due.includes("streak-reminder")
      ? { notifiedStreakDay: toDayKey(now) }
      : {}),
  };
}
