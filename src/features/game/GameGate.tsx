"use client";

import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { UsernamePrompt } from "./components/UsernamePrompt";
import { useGame, type ReadyGame } from "./GameProvider";

interface GameGateProps {
  readonly children: (game: ReadyGame) => ReactNode;
  /** Squelette affiché pendant le chargement. */
  readonly fallback?: ReactNode;
}

const DEFAULT_FALLBACK = (
  <div className="flex flex-col gap-4" aria-busy="true" aria-label="Chargement">
    <div className="skeleton h-14 w-2/3" />
    <div className="skeleton h-40" />
    <div className="skeleton h-64" />
  </div>
);

/**
 * Ne rend ses enfants qu'une fois le jeu chargé et le pseudo choisi ; gère
 * chargement, erreur et choix du pseudo une seule fois.
 */
export function GameGate({
  children,
  fallback = DEFAULT_FALLBACK,
}: GameGateProps) {
  const game = useGame();
  if (game.status === "loading") return fallback;
  if (game.status === "error") {
    return (
      <EmptyState
        title="En-avant !"
        description="Impossible de charger le jeu. Rechargez la page pour remettre le ballon en jeu."
      />
    );
  }
  // Le pseudo est exigé avant de jouer : il sert aux classements.
  if (game.username === null) return <UsernamePrompt game={game} />;
  return children(game);
}
