"use client";

import { Check, Gift } from "lucide-react";
import { AsyncButton } from "@/components/ui/async-button";
import { RewardLabel } from "@/components/ui/reward";
import type { GiveawayProgress } from "@/domain";
import { cn } from "@/lib/utils";

interface GiveawayBannerProps {
  readonly giveaways: readonly GiveawayProgress[];
  readonly onClaim: (giveawayId: string) => Promise<void>;
}

/** Cadeaux du moment, à récupérer d'un geste (jamais crédités d'office). */
export function GiveawayBanner({ giveaways, onClaim }: GiveawayBannerProps) {
  if (giveaways.length === 0) return null;
  return (
    <ul aria-label="Cadeaux du moment" className="flex flex-col gap-3">
      {giveaways.map(({ giveaway, status }) => (
        <li
          key={giveaway.id}
          className={cn(
            "panel flex flex-wrap items-center gap-4 p-5",
            status === "claimable" && "border-gold/60",
          )}
        >
          <Gift
            aria-hidden
            className={cn(
              "size-8 shrink-0",
              status === "claimable" ? "text-gold" : "text-chalk-faint",
            )}
          />
          <div className="min-w-0 flex-1">
            <p className="eyebrow text-gold">Cadeau du moment</p>
            <h2 className="text-2xl font-extrabold text-pretty">
              {giveaway.title}
            </h2>
            <RewardLabel reward={giveaway.reward} className="mt-1 text-base" />
          </div>
          {status === "claimable" ? (
            <AsyncButton
              onAction={() => onClaim(giveaway.id)}
              className="w-full sm:w-auto"
            >
              Récupérer
            </AsyncButton>
          ) : (
            <p className="text-chalk-muted flex items-center gap-1.5 text-sm">
              <Check aria-hidden className="size-4" />
              Récupéré
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
