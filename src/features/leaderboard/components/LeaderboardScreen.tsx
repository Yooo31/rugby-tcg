"use client";

import { MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { EmptyState } from "@/components/ui/empty-state";
import {
  REGIONS,
  regionIdSchema,
  type Leaderboard,
  type LeaderboardEntry,
  type RegionId,
} from "@/domain";
import { gameErrorMessage, GameGate, type ReadyGame } from "@/features/game";
import { cn } from "@/lib/utils";

export function LeaderboardScreen() {
  return <GameGate>{(game) => <LeaderboardView game={game} />}</GameGate>;
}

type Loaded =
  | { readonly status: "loading" }
  | { readonly status: "error"; readonly message: string }
  | { readonly status: "ready"; readonly board: Leaderboard };

const REGION_OPTIONS = Object.entries(REGIONS) as [RegionId, string][];

function LeaderboardView({ game }: { readonly game: ReadyGame }) {
  const [region, setRegion] = useState<RegionId | null>(null);
  // Le résultat garde la région demandée : un changement de filtre repasse en chargement.
  const [result, setResult] = useState<{
    readonly region: RegionId | null;
    readonly loaded: Loaded;
  } | null>(null);
  const { loadLeaderboard } = game;

  useEffect(() => {
    let isCurrent = true;
    loadLeaderboard(region)
      .then((board) => {
        if (isCurrent)
          setResult({ region, loaded: { status: "ready", board } });
      })
      .catch((error: unknown) => {
        if (isCurrent)
          setResult({
            region,
            loaded: { status: "error", message: gameErrorMessage(error) },
          });
      });
    return () => {
      isCurrent = false;
    };
  }, [loadLeaderboard, region]);

  const loaded: Loaded =
    result && result.region === region ? result.loaded : { status: "loading" };

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader eyebrow="Classement" title="Collectionneurs" />

      <div className="flex flex-wrap items-center gap-3">
        <label className="border-line bg-surface text-chalk hover:border-line-strong relative flex min-h-11 items-center gap-2 rounded-full border pr-3 pl-4 text-sm font-medium transition">
          <MapPin aria-hidden className="text-chalk-muted size-4" />
          <span className="sr-only">Région des clubs</span>
          <select
            value={region ?? ""}
            onChange={(event) =>
              setRegion(
                regionIdSchema.safeParse(event.target.value).data ?? null,
              )
            }
            className="appearance-none bg-transparent pr-1 outline-none"
          >
            <option value="" className="bg-surface">
              France entière
            </option>
            {REGION_OPTIONS.map(([id, name]) => (
              <option key={id} value={id} className="bg-surface">
                {name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-chalk-muted text-sm text-pretty">
          Clubs différents possédés
          {region ? `, clubs de la région ${REGIONS[region]}` : ""}.
        </p>
      </div>

      {loaded.status === "loading" ? (
        <div
          aria-busy="true"
          aria-label="Chargement"
          className="flex flex-col gap-2"
        >
          <div className="skeleton h-14" />
          <div className="skeleton h-14" />
          <div className="skeleton h-14" />
        </div>
      ) : loaded.status === "error" ? (
        <EmptyState title="Hors-jeu" description={loaded.message} />
      ) : (
        <Board board={loaded.board} />
      )}
    </div>
  );
}

function Board({ board }: { readonly board: Leaderboard }) {
  if (board.entries.length === 0) {
    return (
      <EmptyState
        title="Terrain vide"
        description="Personne n'est encore classé ici. Ouvrez des boosters pour prendre la tête."
      />
    );
  }
  const meIsListed = board.entries.some((entry) => entry.isMe);
  return (
    <div className="flex flex-col gap-2">
      <ol aria-label="Classement" className="flex flex-col gap-2">
        {board.entries.map((entry) => (
          <Row key={`${entry.rank}:${entry.username}`} entry={entry} />
        ))}
      </ol>
      {board.me && !meIsListed ? (
        <>
          <p aria-hidden className="text-chalk-faint text-center">
            ⋯
          </p>
          <ol aria-label="Votre place" className="flex flex-col gap-2">
            <Row entry={board.me} />
          </ol>
        </>
      ) : null}
      {!board.me ? (
        <p className="text-chalk-muted mt-2 text-center text-sm">
          Vous n&apos;êtes pas encore classé : il vous faut au moins un club.
        </p>
      ) : null}
    </div>
  );
}

function Row({ entry }: { readonly entry: LeaderboardEntry }) {
  return (
    <li
      aria-current={entry.isMe ? "true" : undefined}
      className={cn(
        "panel flex min-h-14 items-center gap-4 px-4",
        entry.isMe && "border-pitch",
      )}
    >
      <span
        className={cn(
          "font-display w-10 shrink-0 text-2xl font-bold tabular-nums",
          entry.rank <= 3 ? "text-gold" : "text-chalk-muted",
        )}
      >
        {entry.rank}
      </span>
      <span className="min-w-0 flex-1 truncate font-medium">
        {entry.username}
        {entry.isMe ? <span className="text-pitch"> (vous)</span> : null}
      </span>
      <span className="font-display shrink-0 text-xl font-bold tabular-nums">
        {entry.clubs}
        <span className="sr-only"> club{entry.clubs > 1 ? "s" : ""}</span>
      </span>
    </li>
  );
}
