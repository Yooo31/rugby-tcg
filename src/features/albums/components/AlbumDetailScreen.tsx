"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import {
  albumClubs,
  albumProgress,
  albumRewardView,
  holdingsByClub,
  computePower,
  getDivision,
  ownedClubIds,
  type Club,
} from "@/domain";
import {
  CardDialog,
  CardSlot,
  ClubCard,
  type CardDialogSelection,
} from "@/features/cards";
import { GameGate, type ReadyGame } from "@/features/game";
import { AlbumRewardPanel } from "./AlbumRewardPanel";
import { AlbumThemeSurface } from "./AlbumTheme";
import { ProgressRing } from "./ProgressRing";

export function AlbumDetailScreen({ albumId }: { readonly albumId: string }) {
  return (
    <GameGate>
      {(game) => <AlbumDetail game={game} albumId={albumId} />}
    </GameGate>
  );
}

/** Du plus haut niveau au plus bas, puis du plus puissant au plus faible. */
function bySportingLevel(a: Club, b: Club): number {
  return (
    getDivision(a.division).tier - getDivision(b.division).tier ||
    computePower(b) - computePower(a) ||
    a.name.localeCompare(b.name, "fr")
  );
}

function AlbumDetail({
  game,
  albumId,
}: {
  readonly game: ReadyGame;
  readonly albumId: string;
}) {
  const [selection, setSelection] = useState<CardDialogSelection | null>(null);
  const album = game.albums.find((candidate) => candidate.id === albumId);

  if (!album) {
    return (
      <EmptyState
        title="Album introuvable"
        description="Cet album n'existe pas ou n'existe plus."
        action={<ButtonLink href="/albums">Tous les albums</ButtonLink>}
      />
    );
  }

  const clubs = albumClubs(album, game.clubs).sort(bySportingLevel);
  const progress = albumProgress(
    album,
    game.clubs,
    ownedClubIds(game.collection),
  );
  const holdings = holdingsByClub(game.collection);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/albums"
        className="text-chalk-muted hover:text-chalk -ml-1 flex min-h-11 items-center gap-1.5 self-start text-sm transition"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Albums
      </Link>

      <AlbumThemeSurface theme={game.cosmetics.equipped["album-theme"]}>
        <header className="flex items-center gap-5">
          <ProgressRing progress={progress} />
          <div className="min-w-0">
            <p className="eyebrow text-(--album-accent)">{album.subtitle}</p>
            <h1 className="mt-1 text-4xl font-extrabold sm:text-5xl">
              {album.title}
            </h1>
            <p className="mt-1.5 text-sm text-(--album-muted) tabular-nums">
              {progress.isComplete
                ? "Album terminé, bravo !"
                : `${progress.owned} sur ${progress.total} · encore ${progress.total - progress.owned} à trouver`}
            </p>
          </div>
        </header>
      </AlbumThemeSurface>

      <AlbumRewardPanel
        view={albumRewardView(album.id, progress, game.claimedAlbumIds)}
        onClaim={() => game.claimAlbumReward(album.id)}
      />

      <ul className="grid grid-cols-3 gap-x-2.5 gap-y-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
        {clubs.map((club) => {
          const owned = holdings.get(club.id);
          return (
            <li key={club.id}>
              {owned ? (
                <button
                  type="button"
                  onClick={() =>
                    setSelection({
                      club,
                      rarity: owned.bestRarity,
                      copies: owned.copies,
                    })
                  }
                  className="ease-out-expo block w-full rounded-xl text-left transition duration-300 hover:-translate-y-1"
                >
                  <ClubCard club={club} rarity={owned.bestRarity} />
                </button>
              ) : (
                <CardSlot club={club} />
              )}
            </li>
          );
        })}
      </ul>

      <CardDialog selection={selection} onClose={() => setSelection(null)} />
    </div>
  );
}
