"use client";

import { ArrowUpDown, SlidersHorizontal, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import {
  DIVISIONS,
  getDivision,
  RARITIES,
  rarityLabel,
  type Rarity,
} from "@/domain";
import { cn } from "@/lib/utils";
import {
  SORT_OPTIONS,
  type CollectionFilters as Filters,
  type SortId,
} from "../lib/filterCollection";

const RARITY_DOT: Record<Rarity, string> = {
  common: "bg-rarity-common",
  rare: "bg-rarity-rare",
  epic: "bg-rarity-epic",
  legendary: "bg-rarity-legendary",
};

interface CollectionFiltersProps {
  readonly filters: Filters;
  readonly onChange: (filters: Filters) => void;
  /** Nombre de cartes affichées avec les filtres courants. */
  readonly resultCount: number;
}

/** Sélectionne la valeur, ou la désélectionne si elle l'était déjà. */
function toggle<T>(current: T | null, value: T): T | null {
  return current === value ? null : value;
}

/**
 * Barre de filtres de la collection : une seule ligne (filtres, tri, décompte),
 * le détail des choix s'ouvrant dans un panneau en bas d'écran.
 */
export function CollectionFilters({
  filters,
  onChange,
  resultCount,
}: CollectionFiltersProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const activeCount =
    Number(filters.rarity !== null) + Number(filters.division !== null);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsSheetOpen(true)}
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-medium transition",
            activeCount > 0
              ? "border-pitch bg-pitch/15 text-pitch"
              : "border-line bg-surface text-chalk hover:border-line-strong",
          )}
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          Filtres
          {activeCount > 0 ? (
            <span className="bg-pitch text-night grid size-5 place-items-center rounded-full text-xs font-bold">
              {activeCount}
            </span>
          ) : null}
        </button>

        <label className="border-line bg-surface text-chalk hover:border-line-strong relative flex min-h-11 items-center gap-2 rounded-full border pr-3 pl-4 text-sm font-medium transition">
          <ArrowUpDown aria-hidden className="text-chalk-muted size-4" />
          <span className="sr-only">Trier par</span>
          <select
            value={filters.sort}
            onChange={(event) =>
              onChange({ ...filters, sort: event.target.value as SortId })
            }
            className="appearance-none bg-transparent pr-1 outline-none"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id} className="bg-surface">
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <p
          className="text-chalk-muted ml-auto text-sm whitespace-nowrap tabular-nums"
          aria-live="polite"
        >
          {resultCount} carte{resultCount > 1 ? "s" : ""}
        </p>
      </div>

      {activeCount > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {filters.rarity ? (
            <ActiveFilter
              label={rarityLabel(filters.rarity)}
              onRemove={() => onChange({ ...filters, rarity: null })}
            />
          ) : null}
          {filters.division ? (
            <ActiveFilter
              label={getDivision(filters.division).label}
              onRemove={() => onChange({ ...filters, division: null })}
            />
          ) : null}
        </ul>
      ) : null}

      <FilterSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        filters={filters}
        onChange={onChange}
        resultCount={resultCount}
      />
    </div>
  );
}

function ActiveFilter({
  label,
  onRemove,
}: {
  readonly label: string;
  readonly onRemove: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onRemove}
        className="bg-surface-raised text-chalk hover:bg-surface-hover flex min-h-9 items-center gap-1.5 rounded-full pr-2.5 pl-3.5 text-sm transition"
      >
        {label}
        <X aria-hidden className="text-chalk-muted size-4" />
        <span className="sr-only">: retirer ce filtre</span>
      </button>
    </li>
  );
}

interface FilterSheetProps extends CollectionFiltersProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

/** Panneau des filtres : ancré en bas sur téléphone (à portée de pouce), centré sur grand écran. */
function FilterSheet({
  isOpen,
  onClose,
  filters,
  onChange,
  resultCount,
}: FilterSheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sur le fond (le <dialog> lui-même) ferme le panneau.
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label="Filtrer la collection"
      className="border-line-strong bg-surface text-chalk mx-auto mt-auto mb-0 w-full max-w-full rounded-t-3xl border p-0 backdrop:bg-black/70 backdrop:backdrop-blur-sm sm:mb-auto sm:max-w-md sm:rounded-3xl"
    >
      <div className="flex flex-col gap-6 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        <div
          aria-hidden
          className="bg-line-strong mx-auto h-1 w-10 rounded-full sm:hidden"
        />

        <fieldset className="flex flex-col gap-3">
          <legend className="eyebrow mb-3">Rareté</legend>
          <div className="flex flex-wrap gap-2">
            {RARITIES.map(({ id, label }) => (
              <Chip
                key={id}
                selected={filters.rarity === id}
                onClick={() =>
                  onChange({ ...filters, rarity: toggle(filters.rarity, id) })
                }
                className="flex items-center gap-2"
              >
                <span
                  aria-hidden
                  className={cn("size-2.5 rotate-45", RARITY_DOT[id])}
                />
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="eyebrow mb-3">Division</legend>
          <div className="flex flex-wrap gap-2">
            {DIVISIONS.map(({ id, label }) => (
              <Chip
                key={id}
                selected={filters.division === id}
                onClick={() =>
                  onChange({
                    ...filters,
                    division: toggle(filters.division, id),
                  })
                }
              >
                {label}
              </Chip>
            ))}
          </div>
        </fieldset>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={() =>
              onChange({ ...filters, rarity: null, division: null })
            }
          >
            Effacer
          </Button>
          <Button className="flex-1" onClick={onClose}>
            Voir {resultCount} carte{resultCount > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
