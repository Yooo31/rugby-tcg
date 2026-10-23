"use client";

import { useEffect, useEffectEvent, useState } from "react";

const TICK_MS = 1000;

/**
 * Millisecondes restantes avant `target` (ms Unix), rafraîchies chaque seconde.
 * Vaut `null` sans échéance, et avant le montage : l'heure du navigateur n'est
 * pas connue pendant le rendu serveur. `onElapsed` est appelé une fois à zéro.
 */
export function useCountdown(
  target: number | null,
  onElapsed: () => void,
): number | null {
  const [remaining, setRemaining] = useState<number | null>(null);
  const notifyElapsed = useEffectEvent(onElapsed);

  useEffect(() => {
    if (target === null) return;

    const tick = () => {
      const left = target - Date.now();
      setRemaining(Math.max(0, left));
      if (left <= 0) {
        clearInterval(timer);
        notifyElapsed();
      }
    };
    const timer = setInterval(tick, TICK_MS);
    tick();
    return () => clearInterval(timer);
  }, [target]);

  return target === null ? null : remaining;
}
