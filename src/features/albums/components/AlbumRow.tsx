import { Gift, Trophy } from "lucide-react";
import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import type { Album, AlbumProgress, RewardStatus } from "@/domain";
import { cn } from "@/lib/utils";

interface AlbumRowProps {
  readonly album: Album;
  readonly progress: AlbumProgress;
  readonly rewardStatus: RewardStatus;
}

/**
 * Tuile cliquable d'un album : titre, puis barre de progression et décompte.
 * Le titre passe sur deux lignes plutôt que d'être tronqué : sur téléphone les
 * tuiles sont étroites et les noms de départements sont longs.
 */
export function AlbumRow({ album, progress, rewardStatus }: AlbumRowProps) {
  const hasRewardWaiting = rewardStatus === "claimable";

  return (
    <Link
      href={`/albums/${album.id}`}
      className={cn(
        "panel hover:border-line-strong flex h-full min-h-18 flex-col justify-between gap-2.5 px-3.5 py-3 transition duration-200 active:scale-[0.99] sm:px-4",
        hasRewardWaiting && "border-gold/60",
      )}
    >
      <span className="font-display line-clamp-2 text-lg leading-[1.05] font-bold tracking-wide uppercase sm:text-xl">
        {album.title}
      </span>
      <span className="flex items-center gap-2.5">
        <ProgressBar
          ratio={progress.ratio}
          complete={progress.isComplete}
          label={`Progression de l'album ${album.title}`}
          className="flex-1"
        />
        <span className="text-chalk-muted flex shrink-0 items-center gap-1 text-sm tabular-nums">
          {hasRewardWaiting ? (
            <Gift
              aria-label="Récompense à récupérer"
              className="text-gold size-4"
            />
          ) : null}
          {rewardStatus === "claimed" ? (
            <Trophy aria-label="Album terminé" className="text-gold size-4" />
          ) : null}
          {progress.owned}/{progress.total}
        </span>
      </span>
    </Link>
  );
}
