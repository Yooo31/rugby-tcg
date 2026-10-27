"use client";

import { Lock } from "lucide-react";
import { RARITIES, type ClubHoldings, type Rarity } from "@/domain";
import { cn } from "@/lib/utils";

/** Couleur de chaque rareté (tokens `--color-rarity-*`), écrite en entier pour Tailwind. */
const RARITY_TEXT: Readonly<Record<Rarity, string>> = {
  common: "text-rarity-common",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
};

const copiesLabel = (count: number) =>
  `${count} exemplaire${count > 1 ? "s" : ""}`;

interface RarityPickerProps {
  readonly copies: ClubHoldings["copies"];
  readonly selected: Rarity;
  readonly onSelect: (rarity: Rarity) => void;
}

/** Les quatre raretés d'un club : celles obtenues se choisissent, les autres sont grisées. */
export function RarityPicker({
  copies,
  selected,
  onSelect,
}: RarityPickerProps) {
  return (
    <ul
      aria-label="Raretés de ce club"
      className="grid w-full grid-cols-4 gap-2"
    >
      {RARITIES.map(({ id, label }) => {
        const count = copies[id];
        return (
          <li key={id}>
            {count ? (
              <button
                type="button"
                aria-pressed={id === selected}
                aria-label={`${label}, ${copiesLabel(count)}`}
                onClick={() => onSelect(id)}
                className={cn(
                  "rounded-control flex min-h-14 w-full flex-col items-center justify-center border px-1 text-xs font-bold transition",
                  RARITY_TEXT[id],
                  id === selected
                    ? "bg-surface-raised border-current"
                    : "border-line hover:bg-surface-hover",
                )}
              >
                <span className="truncate">{label}</span>
                <span className="text-chalk font-display text-base tabular-nums">
                  ×{count}
                </span>
              </button>
            ) : (
              <div
                role="img"
                aria-label={`${label}, pas encore obtenue`}
                className="rounded-control border-line text-chalk-muted flex min-h-14 flex-col items-center justify-center border border-dashed px-1 text-xs font-bold opacity-60"
              >
                <span className="truncate">{label}</span>
                <Lock aria-hidden className="mt-0.5 size-4" />
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
