"use client";

import { useEffect, useRef, type PointerEvent, type RefObject } from "react";

/** Inclinaison maximale de la carte, en degrés. */
const MAX_TILT_DEG = 14;

const TILT_PROPERTIES = [
  "--tilt-x",
  "--tilt-y",
  "--pointer-x",
  "--pointer-y",
  "--active",
] as const;

interface CardTilt<T extends HTMLElement> {
  readonly ref: RefObject<T | null>;
  readonly handlers: {
    readonly onPointerMove?: (event: PointerEvent<T>) => void;
    readonly onPointerLeave?: () => void;
    readonly onPointerCancel?: () => void;
    readonly onPointerUp?: (event: PointerEvent<T>) => void;
  };
}

/**
 * Incline la carte vers le pointeur et déplace ses reflets.
 * Écrit directement des variables CSS sur l'élément : aucun rendu React par mouvement.
 */
export function useCardTilt<T extends HTMLElement>(
  enabled: boolean,
): CardTilt<T> {
  const ref = useRef<T>(null);
  const frame = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  if (!enabled) return { ref, handlers: {} };

  const reset = () => {
    cancelAnimationFrame(frame.current);
    const element = ref.current;
    if (!element) return;
    for (const property of TILT_PROPERTIES)
      element.style.removeProperty(property);
    delete element.dataset.active;
  };

  const onPointerMove = (event: PointerEvent<T>) => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) return;
    const bounds = element.getBoundingClientRect();
    const x = clampUnit((event.clientX - bounds.left) / bounds.width);
    const y = clampUnit((event.clientY - bounds.top) / bounds.height);

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      element.dataset.active = "";
      element.style.setProperty("--pointer-x", `${x * 100}%`);
      element.style.setProperty("--pointer-y", `${y * 100}%`);
      element.style.setProperty(
        "--tilt-x",
        `${(0.5 - y) * 2 * MAX_TILT_DEG}deg`,
      );
      element.style.setProperty(
        "--tilt-y",
        `${(x - 0.5) * 2 * MAX_TILT_DEG}deg`,
      );
      element.style.setProperty("--active", "1");
    });
  };

  return {
    ref,
    handlers: {
      onPointerMove,
      onPointerLeave: reset,
      onPointerCancel: reset,
      // Au doigt, il n'y a pas de « sortie » : on relâche l'effet au lever.
      onPointerUp: (event) => {
        if (event.pointerType !== "mouse") reset();
      },
    },
  };
}

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
