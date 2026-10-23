"use client";

import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  clubRegion,
  computePower,
  departmentName,
  getDivision,
  rarityLabel,
  regionName,
  type Club,
  type Rarity,
} from "@/domain";
import { ClubCard } from "./ClubCard";
import { ShareCardButton } from "./ShareCardButton";

export interface CardDialogSelection {
  readonly club: Club;
  readonly rarity: Rarity;
  readonly count: number;
}

interface CardDialogProps {
  /** Carte à montrer ; `null` ferme la fenêtre. */
  readonly selection: CardDialogSelection | null;
  readonly onClose: () => void;
}

/** Carte en grand, manipulable, avec la fiche du club. */
export function CardDialog({ selection, onClose }: CardDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (selection && !dialog.open) dialog.showModal();
    if (!selection && dialog.open) dialog.close();
  }, [selection]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sur le fond (le <dialog> lui-même) ferme la fenêtre.
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={selection ? `Carte ${selection.club.name}` : undefined}
      className="text-chalk m-auto w-full max-w-sm bg-transparent p-4 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {selection ? (
        <div className="flex flex-col items-center gap-6">
          <ClubCard
            club={selection.club}
            rarity={selection.rarity}
            interactive
            className="max-w-72"
          />
          <ClubFacts {...selection} />
          <ShareCardButton club={selection.club} rarity={selection.rarity} />
          <button
            type="button"
            onClick={onClose}
            className="border-line-strong bg-surface-raised hover:bg-surface-hover grid size-12 place-items-center rounded-full border transition"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">Fermer</span>
          </button>
        </div>
      ) : null}
    </dialog>
  );
}

function ClubFacts({ club, rarity, count }: CardDialogSelection) {
  const facts = [
    ["Division", getDivision(club.division).label],
    ["Puissance", String(computePower(club))],
    ["Rareté", rarityLabel(rarity)],
    ["Exemplaires", `×${count}`],
    ["Département", `${departmentName(club.department)} (${club.department})`],
    ["Région", regionName(clubRegion(club))],
  ] as const;

  return (
    <dl className="panel grid w-full grid-cols-2 gap-x-4 gap-y-3 p-4">
      {facts.map(([term, value]) => (
        <div key={term} className="min-w-0">
          <dt className="eyebrow">{term}</dt>
          <dd className="truncate text-sm font-medium">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
