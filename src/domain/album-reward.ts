import type { AlbumProgress } from "./album";
import type { Reward, RewardStatus } from "./reward";

/** Lingots gagnés par club de l'album : un grand album rapporte plus. */
const INGOTS_PER_CLUB = 5;
/** Plancher pour que les tout petits albums valent quand même le détour. */
const MIN_ALBUM_INGOTS = 20;
/** À partir de cette taille, l'album offre aussi un booster. */
const BOOSTER_REWARD_MIN_CLUBS = 10;

/** Récompense d'un album terminé, proportionnelle au nombre de clubs à réunir. */
export function albumReward(clubCount: number): Reward {
  return {
    ingots: Math.max(MIN_ALBUM_INGOTS, clubCount * INGOTS_PER_CLUB),
    boosters: clubCount >= BOOSTER_REWARD_MIN_CLUBS ? 1 : 0,
  };
}

export function albumRewardStatus(
  albumId: string,
  progress: AlbumProgress,
  claimedAlbumIds: readonly string[],
): RewardStatus {
  if (claimedAlbumIds.includes(albumId)) return "claimed";
  return progress.isComplete ? "claimable" : "locked";
}

/** Récompense et état de récompense d'un album, calculés ensemble pour l'affichage. */
export interface AlbumRewardView {
  readonly reward: Reward;
  readonly status: RewardStatus;
}

export function albumRewardView(
  albumId: string,
  progress: AlbumProgress,
  claimedAlbumIds: readonly string[],
): AlbumRewardView {
  return {
    reward: albumReward(progress.total),
    status: albumRewardStatus(albumId, progress, claimedAlbumIds),
  };
}
