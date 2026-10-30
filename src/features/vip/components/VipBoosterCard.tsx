"use client";

import { Crown } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import type { VipStatus } from "@/domain";
import { NextBoosterCountdown } from "@/features/boosters";
import { cn } from "@/lib/utils";

interface VipBoosterCardProps {
  readonly vip: VipStatus;
  /** Le booster VIP vient d'arriver : relire l'état du joueur. */
  readonly onReady: () => void;
}

/** Booster VIP sur l'accueil (toutes les 48 h) : rien à montrer hors VIP. */
export function VipBoosterCard({ vip, onReady }: VipBoosterCardProps) {
  if (!vip.isActive) return null;
  const isReady = vip.booster.status === "ready";
  return (
    <section
      aria-labelledby="vip-booster-title"
      className={cn(
        "panel flex flex-wrap items-center gap-4 p-5",
        isReady && "border-gold/60",
      )}
    >
      <Crown
        aria-hidden
        className={cn(
          "size-8 shrink-0",
          isReady ? "text-gold" : "text-chalk-faint",
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-gold">Pass VIP</p>
        <h2 id="vip-booster-title" className="text-2xl font-extrabold">
          Booster VIP
        </h2>
        <p className="text-chalk-muted mt-1 text-sm text-pretty">
          Aucune carte commune, au moins une épique. Un toutes les 48 heures.
        </p>
        {isReady ? null : (
          <NextBoosterCountdown
            nextFreeAt={vip.booster.readyAt}
            onElapsed={onReady}
            className="mt-2 text-xl"
          />
        )}
      </div>
      {isReady ? (
        <ButtonLink href="/boosters" className="w-full sm:w-auto">
          Ouvrir
        </ButtonLink>
      ) : null}
    </section>
  );
}
