"use client";

import { Clock } from "lucide-react";
import { formatCountdown } from "@/lib/duration";
import { cn } from "@/lib/utils";
import { useCountdown } from "../hooks/useCountdown";

interface NextBoosterCountdownProps {
  /** Instant du prochain booster gratuit (ms Unix) ; `null` si la réserve est pleine. */
  readonly nextFreeAt: number | null;
  /** Appelé quand le booster est arrivé, pour rafraîchir l'état du joueur. */
  readonly onElapsed: () => void;
  readonly className?: string;
}

/** Chrono jusqu'au prochain booster gratuit. Ne rend rien si la réserve est pleine. */
export function NextBoosterCountdown({
  nextFreeAt,
  onElapsed,
  className,
}: NextBoosterCountdownProps) {
  const remaining = useCountdown(nextFreeAt, onElapsed);
  if (remaining === null) return null;

  return (
    <p
      className={cn(
        "font-display flex items-center gap-2 text-2xl leading-none font-bold tabular-nums",
        className,
      )}
    >
      <Clock aria-hidden className="text-chalk-muted size-5 shrink-0" />
      <span className="sr-only">Prochain booster dans </span>
      {/* role="timer" : annoncé à la demande, pas à chaque seconde. */}
      <span role="timer">{formatCountdown(remaining)}</span>
    </p>
  );
}
