import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { RewardLabel } from "@/components/ui/reward";
import type { MissionProgress } from "@/domain";
import { cn } from "@/lib/utils";

/** Résumé des missions du jour sur l'accueil ; mène à l'écran des missions. */
export function MissionsSummary({
  missions,
}: {
  readonly missions: readonly MissionProgress[];
}) {
  const claimable = missions.filter(
    (entry) => entry.status === "claimable",
  ).length;

  return (
    <Link
      href="/missions"
      className={cn(
        "panel hover:border-line-strong flex flex-col gap-4 p-5 transition duration-200 active:scale-[0.99]",
        claimable > 0 && "border-gold/60",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2
            id="home-missions"
            className="text-chalk-muted text-xl font-bold tracking-wider"
          >
            Missions du jour
          </h2>
          {claimable > 0 ? (
            <p className="text-gold mt-1 text-sm">
              {claimable} récompense{claimable > 1 ? "s" : ""} à récupérer
            </p>
          ) : null}
        </div>
        <ChevronRight
          aria-hidden
          className="text-chalk-faint size-5 shrink-0"
        />
      </div>

      <ul className="flex flex-col gap-2.5">
        {missions.map(({ mission, progress, status }) => (
          <li
            key={mission.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span
              className={cn(
                "flex min-w-0 items-center gap-2",
                status === "claimed" && "text-chalk-muted line-through",
              )}
            >
              {status === "claimed" ? (
                <Check aria-hidden className="size-4 shrink-0" />
              ) : null}
              <span className="truncate">{mission.title}</span>
            </span>
            {status === "locked" ? (
              <span className="text-chalk-muted shrink-0 tabular-nums">
                {progress}/{mission.goal}
              </span>
            ) : (
              <RewardLabel
                reward={mission.reward}
                className={cn(
                  "shrink-0 text-base",
                  status === "claimed" && "opacity-50",
                )}
              />
            )}
          </li>
        ))}
      </ul>
    </Link>
  );
}
