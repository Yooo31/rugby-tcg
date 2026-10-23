"use client";

import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import {
  albumProgress,
  albumRewardStatus,
  FRANCE_ALBUM_ID,
  ownedClubIds,
  type Album,
  type AlbumRule,
} from "@/domain";
import { GameGate, type ReadyGame } from "@/features/game";
import { AlbumRow } from "./AlbumRow";
import { ProgressRing } from "./ProgressRing";

const SECTIONS: readonly {
  readonly type: AlbumRule["type"];
  readonly title: string;
}[] = [
  { type: "division", title: "Divisions" },
  { type: "region", title: "Régions" },
  { type: "department", title: "Départements" },
];

export function AlbumsScreen() {
  return <GameGate>{(game) => <Albums game={game} />}</GameGate>;
}

function Albums({ game }: { readonly game: ReadyGame }) {
  const owned = ownedClubIds(game.collection);
  const progressOf = (album: Album) => albumProgress(album, game.clubs, owned);
  const rewardStatusOf = (album: Album) =>
    albumRewardStatus(album.id, progressOf(album), game.claimedAlbumIds);
  const france = game.albums.find((album) => album.id === FRANCE_ALBUM_ID);
  const completed = game.albums.filter(
    (album) => progressOf(album).isComplete,
  ).length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <ScreenHeader
        eyebrow={`${completed}/${game.albums.length} terminés`}
        title="Albums"
      />

      {france ? (
        <Link
          href={`/albums/${france.id}`}
          className="panel hover:border-line-strong flex items-center gap-4 p-4 transition duration-200 active:scale-[0.99] sm:gap-5 sm:p-5"
        >
          <ProgressRing
            progress={progressOf(france)}
            className="size-20 sm:size-24"
          />
          <div className="min-w-0">
            <p className="eyebrow text-gold">{france.subtitle}</p>
            <h2 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {france.title}
            </h2>
            <p className="text-chalk-muted mt-1.5 text-sm tabular-nums">
              {progressOf(france).owned} clubs sur {progressOf(france).total}
            </p>
          </div>
        </Link>
      ) : null}

      {SECTIONS.map(({ type, title }) => {
        const albums = game.albums.filter((album) => album.rule.type === type);
        return (
          <section
            key={type}
            aria-labelledby={`albums-${type}`}
            className="flex flex-col gap-3"
          >
            <h2
              id={`albums-${type}`}
              className="text-chalk-muted text-xl font-bold tracking-wider"
            >
              {title}
            </h2>
            <ul className="grid grid-cols-2 gap-2 lg:grid-cols-3">
              {albums.map((album) => (
                <li key={album.id}>
                  <AlbumRow
                    album={album}
                    progress={progressOf(album)}
                    rewardStatus={rewardStatusOf(album)}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
