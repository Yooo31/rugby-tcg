"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress-bar";
import { SEASON_TIERS, type SeasonProgress } from "@/domain";

/** Bandeau de l'accueil : la saison en cours et les paliers à récupérer. */
export function SeasonTeaser({
  progress,
}: {
  readonly progress: SeasonProgress | null;
}) {
  if (!progress) return null;
  const claimable = progress.tiers.filter(
    (entry) =>
      entry.free.status === "claimable" || entry.premium.status === "claimable",
  ).length;
  return (
    <Link
      href="/saison"
      className="panel hover:bg-surface-hover flex flex-col gap-2 p-4 transition"
    >
      <span className="eyebrow text-pitch">Passe de saison</span>
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-xl font-bold">{progress.season.title}</span>
        <span className="text-chalk-muted text-sm tabular-nums">
          Palier {progress.tier} / {SEASON_TIERS}
        </span>
      </span>
      <ProgressBar
        ratio={progress.tier / SEASON_TIERS}
        label="Paliers atteints"
      />
      {claimable > 0 ? (
        <span className="text-gold text-sm font-medium">
          {claimable} palier{claimable > 1 ? "s" : ""} à récupérer
        </span>
      ) : null}
    </Link>
  );
}
