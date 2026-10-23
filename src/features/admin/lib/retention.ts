import { daysBetween } from "@/lib/dates";

/** Un joueur vu par les statistiques : son jour d'inscription et ses jours de jeu. */
export interface PlayerActivity {
  readonly signupDay: string;
  /** Jours (heure de Paris) où il a ouvert au moins un booster. */
  readonly activeDays: ReadonlySet<string>;
}

export interface RetentionRate {
  /** Jours après l'inscription (J+1, J+7, J+30). */
  readonly day: number;
  /** Joueurs inscrits depuis assez longtemps pour être comptés. */
  readonly eligible: number;
  /** Parmi eux, ceux revenus jouer ce jour-là ou après. */
  readonly retained: number;
}

/** Jalons suivis par le tableau de bord. */
export const RETENTION_DAYS = [1, 7, 30] as const;

/**
 * Rétention « à J+n ou après » : part des joueurs revenus jouer au moins une
 * fois n jours ou plus après leur inscription. Plus robuste que le jour exact
 * quand il y a peu de joueurs ; seuls comptent ceux inscrits depuis n jours.
 */
export function retention(
  players: readonly PlayerActivity[],
  today: string,
  day: number,
): RetentionRate {
  const eligible = players.filter(
    (player) => daysBetween(player.signupDay, today) >= day,
  );
  const retained = eligible.filter((player) =>
    [...player.activeDays].some(
      (active) => daysBetween(player.signupDay, active) >= day,
    ),
  );
  return { day, eligible: eligible.length, retained: retained.length };
}

export interface DailyActivity {
  readonly day: string;
  readonly players: number;
  readonly openings: number;
}

/** Les `count` derniers jours jusqu'à `today` inclus, jours sans activité compris. */
export function lastDays(
  activity: readonly DailyActivity[],
  days: readonly string[],
): DailyActivity[] {
  const byDay = new Map(activity.map((entry) => [entry.day, entry]));
  return days.map((day) => byDay.get(day) ?? { day, players: 0, openings: 0 });
}
