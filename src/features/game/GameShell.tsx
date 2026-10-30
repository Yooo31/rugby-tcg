"use client";

import { ShoppingCart, Trophy, UserRound } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { IngotAmount } from "@/components/ui/reward";
import { albumProgress, albumRewardStatus, ownedClubIds } from "@/domain";
import { listenForInstallPrompt } from "@/features/install";
import { useGame, type ReadyGame } from "./GameProvider";

/** Classement des collectionneurs, accessible de partout par l'en-tête. */
const LEADERBOARD_PATH = "/classement";

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
  const pathname = usePathname();
  const isReady = game.status === "ready";
  // L'invite d'installation peut arriver sur n'importe quelle page du jeu.
  useEffect(listenForInstallPrompt, []);

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
        <div className="flex items-center gap-1.5 sm:gap-2">
          {isReady ? (
            <Link
              href="/boutique"
              aria-label={`Boutique : ${game.ingots} lingots`}
              className="border-line-strong bg-surface-raised hover:bg-surface-hover flex min-h-11 items-center gap-1.5 rounded-full border pr-3 pl-2.5 transition sm:gap-2 sm:pr-4 sm:pl-3"
            >
              <ShoppingCart aria-hidden className="text-pitch size-5" />
              <IngotAmount amount={game.ingots} className="text-lg" />
            </Link>
          ) : null}
          <Link
            href={LEADERBOARD_PATH}
            aria-label="Classement"
            aria-current={
              pathname.startsWith(LEADERBOARD_PATH) ? "page" : undefined
            }
            className="border-line-strong bg-surface-raised hover:bg-surface-hover aria-[current=page]:border-gold aria-[current=page]:text-gold grid size-11 shrink-0 place-items-center rounded-full border transition"
          >
            <Trophy aria-hidden className="size-5" />
          </Link>
          <Link
            href="/compte"
            aria-label="Mon compte"
            className="border-line-strong bg-surface-raised hover:bg-surface-hover grid size-11 shrink-0 place-items-center rounded-full border transition"
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
