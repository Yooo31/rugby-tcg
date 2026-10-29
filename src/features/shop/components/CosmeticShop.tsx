"use client";

import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AsyncButton } from "@/components/ui/async-button";
import { Button } from "@/components/ui/button";
import { IngotAmount } from "@/components/ui/reward";
import {
  COSMETIC_KINDS,
  cosmeticsOfKind,
  type Club,
  type Cosmetic,
  type CosmeticKind,
  type CosmeticUnlock,
} from "@/domain";
import { AlbumThemeSurface } from "@/features/albums";
import { CardBack, ClubCard } from "@/features/cards";
import type { ReadyGame } from "@/features/game";
import { cn } from "@/lib/utils";

export const COSMETIC_KIND_LABELS: Record<CosmeticKind, string> = {
  "card-back": "Dos de carte",
  "card-frame": "Cadres de carte",
  "album-theme": "Thèmes d'album",
};

const KIND_HINTS: Record<CosmeticKind, string> = {
  "card-back": "Vu à l'ouverture de vos boosters.",
  "card-frame": "Autour de vos cartes, sans changer leur rareté.",
  "album-theme": "En tête de vos pages d'album.",
};

function unlockLabel(unlock: CosmeticUnlock): string {
  switch (unlock.type) {
    case "streak":
      return `Offert pour ${unlock.days} jours de série`;
    case "albums":
      return unlock.count > 1
        ? `Offert pour ${unlock.count} albums terminés`
        : "Offert pour un album terminé";
  }
}

/** Section « Cosmétiques » de la boutique : aperçu, prix, achat et équipement. */
export function CosmeticShop({ game }: { readonly game: ReadyGame }) {
  // Club d'exemple pour l'aperçu des cadres : le premier du catalogue.
  const sample = game.clubs[0];
  const [previewed, setPreviewed] = useState<Cosmetic | null>(null);
  return (
    <section aria-labelledby="cosmetiques" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="cosmetiques" className="text-2xl font-bold">
          Cosmétiques
        </h2>
        <p className="text-chalk-muted text-sm text-pretty">
          Pour vous distinguer, sans rien changer au jeu. Touchez un cosmétique
          pour le voir en grand.
        </p>
      </div>
      {COSMETIC_KINDS.map((kind) => (
        <section
          key={kind}
          aria-labelledby={`cosmetiques-${kind}`}
          className="flex flex-col gap-2"
        >
          <div>
            <h3 id={`cosmetiques-${kind}`} className="text-xl font-bold">
              {COSMETIC_KIND_LABELS[kind]}
            </h3>
            <p className="text-chalk-muted text-sm">{KIND_HINTS[kind]}</p>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {cosmeticsOfKind(kind).map((cosmetic) => (
              <li key={cosmetic.id}>
                <CosmeticOffer
                  cosmetic={cosmetic}
                  game={game}
                  sample={sample}
                  onPreview={() => setPreviewed(cosmetic)}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
      <CosmeticPreviewDialog
        cosmetic={previewed}
        game={game}
        sample={sample}
        onClose={() => setPreviewed(null)}
      />
    </section>
  );
}

/** Aperçu d'un cosmétique : en vignette dans la liste, en grand dans la fenêtre. */
function CosmeticPreview({
  cosmetic,
  sample,
  isLarge = false,
}: {
  readonly cosmetic: Cosmetic;
  readonly sample: Club | undefined;
  readonly isLarge?: boolean;
}) {
  const width = isLarge ? "w-56" : "w-24";
  switch (cosmetic.kind) {
    case "card-back":
      return <CardBack design={cosmetic.id} className={cn("mx-auto", width)} />;
    case "card-frame":
      return sample ? (
        <ClubCard
          club={sample}
          rarity="rare"
          frame={cosmetic.id}
          interactive={isLarge}
          className={cn("mx-auto", width)}
        />
      ) : null;
    case "album-theme":
      return (
        <AlbumThemeSurface
          theme={cosmetic.id}
          className={cn(
            "border-line flex aspect-[5/7] items-end rounded-xl border",
            isLarge ? "w-56 p-5" : "w-24 p-3",
          )}
        >
          <p className={cn("font-bold", isLarge ? "text-3xl" : "text-lg")}>
            Album
          </p>
        </AlbumThemeSurface>
      );
  }
}

/** Cosmétique en grand, avec son achat ou son équipement. */
function CosmeticPreviewDialog({
  cosmetic,
  game,
  sample,
  onClose,
}: {
  readonly cosmetic: Cosmetic | null;
  readonly game: ReadyGame;
  readonly sample: Club | undefined;
  readonly onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (cosmetic && !dialog.open) dialog.showModal();
    if (!cosmetic && dialog.open) dialog.close();
  }, [cosmetic]);

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sur le fond (le <dialog> lui-même) ferme la fenêtre.
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={cosmetic ? `Aperçu : ${cosmetic.name}` : undefined}
      className="text-chalk m-auto w-full max-w-sm bg-transparent p-4 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {cosmetic ? (
        <div className="flex flex-col items-center gap-5">
          <CosmeticPreview cosmetic={cosmetic} sample={sample} isLarge />
          <div className="panel flex w-full flex-col gap-3 p-4">
            <div className="flex flex-col gap-1">
              <p className="eyebrow">{COSMETIC_KIND_LABELS[cosmetic.kind]}</p>
              <h3 className="font-display text-2xl leading-tight font-bold uppercase">
                {cosmetic.name}
              </h3>
              <p className="text-chalk-muted text-sm text-pretty">
                {cosmetic.description}
              </p>
              <UnlockHint cosmetic={cosmetic} game={game} />
            </div>
            <CosmeticAction cosmetic={cosmetic} game={game} />
          </div>
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

function UnlockHint({
  cosmetic,
  game,
}: {
  readonly cosmetic: Cosmetic;
  readonly game: ReadyGame;
}) {
  if (game.cosmetics.owned.includes(cosmetic.id) || !cosmetic.unlock)
    return null;
  return (
    <p className="text-gold text-xs font-medium">
      {unlockLabel(cosmetic.unlock)}
    </p>
  );
}

/** Équipé, à équiper, ou à acheter en lingots. */
function CosmeticAction({
  cosmetic,
  game,
}: {
  readonly cosmetic: Cosmetic;
  readonly game: ReadyGame;
}) {
  const isOwned = game.cosmetics.owned.includes(cosmetic.id);
  const isEquipped = game.cosmetics.equipped[cosmetic.kind] === cosmetic.id;
  if (isEquipped)
    return (
      <Button variant="secondary" block disabled>
        Équipé
      </Button>
    );
  if (isOwned)
    return (
      <AsyncButton
        variant="secondary"
        block
        onAction={() => game.equipCosmetic(cosmetic.id)}
      >
        Équiper
      </AsyncButton>
    );
  return (
    <AsyncButton
      block
      onAction={() => game.buyCosmetic(cosmetic.id)}
      disabled={game.ingots < cosmetic.ingots}
      aria-label={`Acheter ${cosmetic.name} pour ${cosmetic.ingots} lingots`}
      className="px-2"
    >
      <IngotAmount amount={cosmetic.ingots} />
    </AsyncButton>
  );
}

function CosmeticOffer({
  cosmetic,
  game,
  sample,
  onPreview,
}: {
  readonly cosmetic: Cosmetic;
  readonly game: ReadyGame;
  readonly sample: Club | undefined;
  readonly onPreview: () => void;
}) {
  return (
    <article
      aria-label={cosmetic.name}
      className="panel flex h-full flex-col gap-3 p-3"
    >
      <button
        type="button"
        onClick={onPreview}
        className="rounded-control mx-auto transition hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <span aria-hidden className="pointer-events-none block">
          <CosmeticPreview cosmetic={cosmetic} sample={sample} />
        </span>
        <span className="sr-only">Voir en grand : {cosmetic.name}</span>
      </button>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg leading-tight font-bold uppercase">
          {cosmetic.name}
        </p>
        <p className="text-chalk-muted text-xs text-pretty">
          {cosmetic.description}
        </p>
        <UnlockHint cosmetic={cosmetic} game={game} />
      </div>
      <div className="mt-auto">
        <CosmeticAction cosmetic={cosmetic} game={game} />
      </div>
    </article>
  );
}
