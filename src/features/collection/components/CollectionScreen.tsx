"use client";

import { useMemo, useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { duplicateCount, ownedClubIds, totalCards } from "@/domain";
import {
  CardDialog,
  ClubCard,
  SpecialCard,
  type CardDialogSelection,
} from "@/features/cards";
import { GameGate, type ReadyGame } from "@/features/game";
import {
  filterCollection,
  type CollectionFilters as Filters,
} from "../lib/filterCollection";
import { CollectionFilters } from "./CollectionFilters";

export function CollectionScreen() {
  return <GameGate>{(game) => <Collection game={game} />}</GameGate>;
}

function Collection({ game }: { readonly game: ReadyGame }) {
  const [filters, setFilters] = useState<Filters>({
    rarity: null,
    division: null,
    sort: "recent",
  });
  const [selection, setSelection] = useState<CardDialogSelection | null>(null);

  const entries = useMemo(
    () => filterCollection(game.collection, game.clubsById, filters),
    [game.collection, game.clubsById, filters],
  );

  const stats = [
    ["Clubs", `${ownedClubIds(game.collection).size}/${game.clubs.length}`],
    ["Cartes", String(totalCards(game.collection))],
    ["Doublons", String(duplicateCount(game.collection))],
  ] as const;

  if (game.collection.length === 0) {
    return (
      <div className="flex flex-col gap-6 sm:gap-8">
        <ScreenHeader eyebrow="Vos cartes" title="Collection" />
        <EmptyState
          title="Vestiaire vide"
          description="Vous n'avez encore aucune carte. Ouvrez votre premier booster pour lancer la collection."
          action={<ButtonLink href="/boosters">Ouvrir un booster</ButtonLink>}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      <ScreenHeader eyebrow="Vos cartes" title="Collection" />

      <dl className="panel grid grid-cols-3 divide-x divide-white/8 py-2.5 sm:py-4">
        {stats.map(([label, value]) => (
          <div key={label} className="flex flex-col-reverse items-center gap-1">
            <dt className="eyebrow">{label}</dt>
            <dd className="font-display text-2xl font-bold tabular-nums sm:text-3xl">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {game.specialCards.length > 0 ? (
        <section
          aria-labelledby="cartes-speciales"
          className="flex flex-col gap-3"
        >
          <h2 id="cartes-speciales" className="eyebrow text-rarity-legendary">
            Cartes spéciales
          </h2>
          <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {game.specialCards.map((owned) => (
              <li key={owned.id} className="relative">
                <SpecialCard id={owned.id} interactive />
                {owned.count > 1 ? (
                  <span
                    aria-label={`${owned.count} exemplaires`}
                    className="border-line-strong bg-night font-display absolute -top-2 -right-1 rounded-full border px-2 text-sm font-bold tabular-nums"
                  >
                    ×{owned.count}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <CollectionFilters
        filters={filters}
        onChange={setFilters}
        resultCount={entries.length}
      />

      {entries.length === 0 ? (
        <p className="text-chalk-muted py-12 text-center text-sm">
          Aucune carte ne correspond à ces filtres.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {entries.map(({ club, holdings, rarity, count }) => (
            <li key={club.id} className="relative">
              <button
                type="button"
                onClick={() =>
                  setSelection({ club, rarity, copies: holdings.copies })
                }
                className="ease-out-expo block w-full rounded-2xl text-left transition duration-300 hover:-translate-y-1.5"
              >
                <ClubCard club={club} rarity={rarity} />
              </button>
              {count > 1 ? (
                <span
                  aria-hidden
                  className="border-line-strong bg-night font-display absolute -top-2 -right-1 rounded-full border px-2 text-sm font-bold tabular-nums"
                >
                  ×{count}
                </span>
              ) : null}
            </li>
          ))}
        </ul>
      )}

      <CardDialog selection={selection} onClose={() => setSelection(null)} />
    </div>
  );
}
