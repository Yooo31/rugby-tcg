"use client";

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
import { formatEuros } from "@/lib/money";

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

/** Le paiement en euros n'est pas encore branché (Stripe, issue #48). */
const EURO_NOTICE_ID = "cosmetiques-euros";

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
  return (
    <section aria-labelledby="cosmetiques" className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="cosmetiques" className="text-2xl font-bold">
          Cosmétiques
        </h2>
        <p id={EURO_NOTICE_ID} className="text-chalk-muted text-sm text-pretty">
          Pour vous distinguer, sans rien changer au jeu. Paiement en euros
          bientôt disponible : pour l&apos;instant, en lingots.
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
                />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}

function CosmeticPreview({
  cosmetic,
  sample,
}: {
  readonly cosmetic: Cosmetic;
  readonly sample: Club | undefined;
}) {
  switch (cosmetic.kind) {
    case "card-back":
      return <CardBack design={cosmetic.id} className="mx-auto w-24" />;
    case "card-frame":
      return sample ? (
        <ClubCard
          club={sample}
          rarity="rare"
          frame={cosmetic.id}
          className="mx-auto w-24"
        />
      ) : null;
    case "album-theme":
      return (
        <AlbumThemeSurface
          theme={cosmetic.id}
          className="border-line flex aspect-[5/7] w-24 items-end rounded-xl border p-3"
        >
          <h4 className="text-lg font-bold">Album</h4>
        </AlbumThemeSurface>
      );
  }
}

function CosmeticOffer({
  cosmetic,
  game,
  sample,
}: {
  readonly cosmetic: Cosmetic;
  readonly game: ReadyGame;
  readonly sample: Club | undefined;
}) {
  const isOwned = game.cosmetics.owned.includes(cosmetic.id);
  const isEquipped = game.cosmetics.equipped[cosmetic.kind] === cosmetic.id;

  return (
    <article
      aria-label={cosmetic.name}
      className="panel flex h-full flex-col gap-3 p-3"
    >
      <div aria-hidden className="pointer-events-none mx-auto">
        <CosmeticPreview cosmetic={cosmetic} sample={sample} />
      </div>
      <div className="flex flex-col gap-1">
        <p className="font-display text-lg leading-tight font-bold uppercase">
          {cosmetic.name}
        </p>
        <p className="text-chalk-muted text-xs text-pretty">
          {cosmetic.description}
        </p>
        {!isOwned && cosmetic.unlock ? (
          <p className="text-gold text-xs font-medium">
            {unlockLabel(cosmetic.unlock)}
          </p>
        ) : null}
      </div>
      <div className="mt-auto flex flex-col gap-1">
        {isEquipped ? (
          <Button variant="secondary" block disabled>
            Équipé
          </Button>
        ) : isOwned ? (
          <AsyncButton
            variant="secondary"
            block
            onAction={() => game.equipCosmetic(cosmetic.id)}
          >
            Équiper
          </AsyncButton>
        ) : (
          <AsyncButton
            block
            onAction={() => game.buyCosmetic(cosmetic.id)}
            disabled={game.ingots < cosmetic.ingots}
            aria-label={`Acheter ${cosmetic.name} pour ${cosmetic.ingots} lingots`}
            className="px-2"
          >
            <IngotAmount amount={cosmetic.ingots} />
          </AsyncButton>
        )}
        {!isOwned && cosmetic.priceCents !== null ? (
          <p
            className="text-chalk-faint text-center text-xs"
            aria-describedby={EURO_NOTICE_ID}
          >
            ou {formatEuros(cosmetic.priceCents)}, bientôt
          </p>
        ) : null}
      </div>
    </article>
  );
}
