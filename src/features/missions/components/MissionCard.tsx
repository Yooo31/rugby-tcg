import { Check } from "lucide-react";
import { AsyncButton } from "@/components/ui/async-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { RewardLabel } from "@/components/ui/reward";
import type { MissionProgress } from "@/domain";
import { cn } from "@/lib/utils";

interface MissionCardProps {
  readonly entry: MissionProgress;
  readonly onClaim: () => Promise<void>;
}

export function MissionCard({
  entry: { mission, progress, status },
  onClaim,
}: MissionCardProps) {
  const isClaimed = status === "claimed";

  return (
    <article
      className={cn(
        "panel flex flex-col gap-4 p-5 transition-opacity",
        status === "claimable" && "border-gold/60",
        isClaimed && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-2xl font-bold">{mission.title}</h2>
        <RewardLabel reward={mission.reward} className="shrink-0" />
      </div>

      <div className="flex items-center gap-3">
        <ProgressBar
          ratio={progress / mission.goal}
          complete={status !== "locked"}
          label={`Avancement : ${mission.title}`}
          className="flex-1"
        />
        <span className="text-chalk-muted text-sm tabular-nums">
          {progress}/{mission.goal}
        </span>
      </div>

      {status === "claimable" ? (
        <AsyncButton
          onAction={onClaim}
          className="bg-gold hover:bg-chalk shadow-none"
        >
          Récupérer
        </AsyncButton>
      ) : null}
      {isClaimed ? (
        <p className="text-chalk-muted flex items-center gap-1.5 text-sm">
          <Check aria-hidden className="size-4" />
          Récompense récupérée
        </p>
      ) : null}
    </article>
  );
}
