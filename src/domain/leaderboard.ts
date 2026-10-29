/** Classement des collectionneurs : au nombre de clubs différents possédés. */

export interface LeaderboardScore {
  readonly playerId: string;
  readonly username: string;
  /** Clubs différents possédés, toutes raretés confondues. */
  readonly clubs: number;
  /** Membre du pass VIP en ce moment (badge). */
  readonly isVip?: boolean;
}

export interface LeaderboardEntry {
  /** Rang « sportif » : deux ex æquo partagent le rang, le suivant le saute (1, 1, 3). */
  readonly rank: number;
  readonly username: string;
  readonly clubs: number;
  readonly isMe: boolean;
  readonly isVip: boolean;
}

export interface Leaderboard {
  readonly entries: readonly LeaderboardEntry[];
  /** Le joueur lui-même, s'il est classé ; utile quand il est hors du haut du tableau. */
  readonly me: LeaderboardEntry | null;
}

/** Nombre de joueurs affichés en tête du classement. */
export const LEADERBOARD_SIZE = 50;

/**
 * Classe des scores (même règle que `rank()` en SQL) : plus de clubs d'abord,
 * puis le pseudo pour départager l'affichage des ex æquo. Un joueur sans
 * aucun club n'est pas classé.
 */
export function rankScores(
  scores: readonly LeaderboardScore[],
  myId: string,
  size = LEADERBOARD_SIZE,
): Leaderboard {
  const sorted = scores
    .filter((score) => score.clubs > 0)
    .toSorted(
      (a, b) => b.clubs - a.clubs || a.username.localeCompare(b.username, "fr"),
    );

  const entries: LeaderboardEntry[] = [];
  let me: LeaderboardEntry | null = null;
  let rank = 0;
  sorted.forEach((score, index) => {
    // Un ex æquo garde le rang de celui qui le précède.
    if (index === 0 || sorted[index - 1].clubs !== score.clubs)
      rank = index + 1;
    const entry: LeaderboardEntry = {
      rank,
      username: score.username,
      clubs: score.clubs,
      isMe: score.playerId === myId,
      isVip: score.isVip ?? false,
    };
    if (rank <= size) entries.push(entry);
    if (entry.isMe) me = entry;
  });
  return { entries, me };
}
