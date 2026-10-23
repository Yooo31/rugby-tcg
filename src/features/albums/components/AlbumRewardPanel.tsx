import { Check, Lock } from "lucide-react";
import { AsyncButton } from "@/components/ui/async-button";
import { RewardLabel } from "@/components/ui/reward";
import type { AlbumRewardView } from "@/domain";
import { cn } from "@/lib/utils";

interface AlbumRewardPanelProps {
  readonly view: AlbumRewardView;
  readonly onClaim: () => Promise<void>;
}

/** Récompense de l'album : annoncée tant qu'il est incomplet, à récupérer une fois terminé. */
export function AlbumRewardPanel({
  view: { reward, status },
  onClaim,
}: AlbumRewardPanelProps) {
  return (
    <section
      aria-label="Récompense de l'album"
      className={cn(
        "panel flex flex-wrap items-center justify-between gap-x-4 gap-y-3 p-4",
        status === "claimable" && "border-gold/60",
      )}
    >
      <div>
        <p className="eyebrow">Récompense</p>
        <RewardLabel
          reward={reward}
          className={cn("mt-1 text-2xl", status === "claimed" && "opacity-50")}
        />
      </div>

      {status === "locked" ? (
        <p className="text-chalk-muted flex items-center gap-1.5 text-sm">
          <Lock aria-hidden className="size-4" />
          Terminez l&apos;album
        </p>
      ) : null}
      {status === "claimable" ? (
        <AsyncButton
          onAction={onClaim}
          className="bg-gold hover:bg-chalk shadow-none"
        >
          Récupérer
        </AsyncButton>
      ) : null}
      {status === "claimed" ? (
        <p className="text-chalk-muted flex items-center gap-1.5 text-sm">
          <Check aria-hidden className="size-4" />
          Récupérée
        </p>
      ) : null}
    </section>
  );
}
