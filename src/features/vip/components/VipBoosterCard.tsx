"use client";

import { Check, Crown } from "lucide-react";
import { AsyncButton } from "@/components/ui/async-button";
import type { VipStatus } from "@/domain";
import { cn } from "@/lib/utils";

interface VipBoosterCardProps {
  readonly vip: VipStatus;
  readonly onClaim: () => Promise<void>;
}

/** Booster VIP du jour, sur l'accueil : rien à montrer hors VIP. */
export function VipBoosterCard({ vip, onClaim }: VipBoosterCardProps) {
  if (!vip.isActive) return null;
  const isClaimable = vip.dailyBooster === "claimable";
  return (
    <section
      aria-labelledby="vip-booster-title"
      className={cn(
        "panel flex flex-wrap items-center gap-4 p-5",
        isClaimable && "border-gold/60",
      )}
    >
      <Crown
        aria-hidden
        className={cn(
          "size-8 shrink-0",
          isClaimable ? "text-gold" : "text-chalk-faint",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-gold">Pass VIP</p>
        <h2 id="vip-booster-title" className="text-2xl font-extrabold">
          Booster VIP du jour
        </h2>
        <p className="text-chalk-muted mt-1 text-sm text-pretty">
          {isClaimable
            ? "À prendre aujourd'hui : il ne se garde pas pour demain."
            : "Un nouveau booster vous attend demain."}
        </p>
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
