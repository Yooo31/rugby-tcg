"use client";

import { UserRound } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IngotAmount } from "@/components/ui/reward";
import { albumProgress, albumRewardStatus, ownedClubIds } from "@/domain";
import { useGame, type ReadyGame } from "./GameProvider";

/** Nombre de récompenses d'album terminées mais pas encore récupérées. */
function claimableAlbumCount(game: ReadyGame): number {
  const owned = ownedClubIds(game.collection);
  return game.albums.filter(
    (album) =>
      albumRewardStatus(
        album.id,
        albumProgress(album, game.clubs, owned),
        game.claimedAlbumIds,
      ) === "claimable",
  ).length;
}

/** Coquille du jeu branchée sur l'état du joueur : solde de lingots et pastilles de récompense. */
export function GameShell({ children }: { readonly children: ReactNode }) {
  const game = useGame();
  const isReady = game.status === "ready";

  return (
    <AppShell
      badges={
        isReady
          ? {
              "/missions": game.missions.filter(
                (entry) => entry.status === "claimable",
              ).length,
              "/albums": claimableAlbumCount(game),
              "/":
                (game.streak.status === "claimable" ? 1 : 0) +
                game.giveaways.filter((entry) => entry.status === "claimable")
                  .length,
            }
          : {}
      }
      headerEnd={
        <div className="flex items-center gap-2">
          {isReady ? (
            <Link
              href="/boutique"
              aria-label={`${game.ingots} lingots, ouvrir la boutique`}
              className="border-line-strong bg-surface-raised hover:bg-surface-hover flex min-h-11 items-center rounded-full border px-4 transition"
            >
              <IngotAmount amount={game.ingots} className="text-lg" />
            </Link>
          ) : null}
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="border-line-strong bg-surface-raised hover:bg-surface-hover grid size-11 place-items-center rounded-full border transition"
          >
            <UserRound aria-hidden className="size-5" />
          </Link>
        </div>
      }
    >
      {children}
    </AppShell>
  );
}
