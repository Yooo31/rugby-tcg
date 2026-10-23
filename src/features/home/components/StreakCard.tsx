"use client";

import { Check, Flame } from "lucide-react";
import { AsyncButton } from "@/components/ui/async-button";
import { RewardLabel } from "@/components/ui/reward";
import { streakReward, type StreakProgress } from "@/domain";
import { cn } from "@/lib/utils";

interface StreakCardProps {
  readonly streak: StreakProgress;
  readonly onClaim: () => Promise<void>;
}

/** Série de connexion : la récompense du jour, à récupérer d'un geste. */
export function StreakCard({ streak, onClaim }: StreakCardProps) {
  const isClaimable = streak.status === "claimable";
  const tomorrow = streakReward(streak.day + 1);
  return (
    <section
      aria-labelledby="streak-title"
      className={cn(
        "panel flex flex-wrap items-center gap-4 p-5",
        isClaimable && "border-gold/60",
      )}
    >
      <Flame
        aria-hidden
        className={cn(
          "size-8 shrink-0",
          isClaimable ? "text-gold" : "text-chalk-faint",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-gold">Série de connexion</p>
        <h2 id="streak-title" className="text-2xl font-extrabold">
          Jour {streak.day}
        </h2>
        {isClaimable ? (
          <RewardLabel reward={streak.reward} className="mt-1 text-base" />
        ) : (
          <p className="text-chalk-muted mt-1 text-sm text-pretty">
            Revenez demain pour le jour {streak.day + 1} :{" "}
            <RewardLabel reward={tomorrow} className="text-sm" />
          </p>
        )}
      </div>
      {isClaimable ? (
        <AsyncButton onAction={onClaim} className="w-full sm:w-auto">
          Récupérer
        </AsyncButton>
      ) : (
        <p className="text-chalk-muted flex items-center gap-1.5 text-sm">
          <Check aria-hidden className="size-4" />
          Récupéré
        </p>
      )}
    </section>
  );
}
