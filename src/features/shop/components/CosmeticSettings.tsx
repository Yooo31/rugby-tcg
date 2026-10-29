"use client";

import Link from "next/link";
import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import {
  COSMETIC_KINDS,
  cosmeticsOfKind,
  type CosmeticId,
  type CosmeticKind,
} from "@/domain";
import { GameGate, gameErrorMessage, type ReadyGame } from "@/features/game";
import { COSMETIC_KIND_LABELS } from "./CosmeticShop";

/** Choix des cosmétiques équipés, sur la page Compte, parmi ceux possédés. */
export function CosmeticSettings() {
  return (
    <GameGate fallback={<div className="skeleton h-32" />}>
      {(game) => <CosmeticChoices game={game} />}
    </GameGate>
  );
}

function CosmeticChoices({ game }: { readonly game: ReadyGame }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<CosmeticId | null>(null);

  const equip = async (id: CosmeticId) => {
    setPending(id);
    setError(null);
    try {
      await game.equipCosmetic(id);
    } catch (caught) {
      setError(gameErrorMessage(caught));
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {COSMETIC_KINDS.map((kind) => (
        <KindChoices
          key={kind}
          kind={kind}
          game={game}
          pending={pending}
          onEquip={equip}
        />
      ))}
      {error ? (
        <p role="alert" className="text-danger text-sm">
          {error}
        </p>
      ) : null}
      <Link
        href="/boutique"
        className="text-chalk-muted hover:text-chalk flex min-h-11 items-center text-sm underline underline-offset-2"
      >
        Voir tous les cosmétiques en boutique
      </Link>
    </div>
  );
}

function KindChoices({
  kind,
  game,
  pending,
  onEquip,
}: {
  readonly kind: CosmeticKind;
  readonly game: ReadyGame;
  readonly pending: CosmeticId | null;
  readonly onEquip: (id: CosmeticId) => Promise<void>;
}) {
  const owned = cosmeticsOfKind(kind).filter(({ id }) =>
    game.cosmetics.owned.includes(id),
  );
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium">
        {COSMETIC_KIND_LABELS[kind]}
      </legend>
      <div className="flex flex-wrap gap-2">
        {owned.map((cosmetic) => (
          <Chip
            key={cosmetic.id}
            selected={game.cosmetics.equipped[kind] === cosmetic.id}
            disabled={pending !== null}
            onClick={() => void onEquip(cosmetic.id)}
          >
            {cosmetic.name}
          </Chip>
        ))}
      </div>
    </fieldset>
  );
}
