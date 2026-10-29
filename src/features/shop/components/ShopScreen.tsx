"use client";

import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { IngotAmount } from "@/components/ui/reward";
import {
  boosterPriceCents,
  boostersFor,
  INGOT_PACKS,
  type IngotPack,
} from "@/domain";
import { BoosterOffers } from "@/features/boosters";
import { GameGate, type ReadyGame } from "@/features/game";
import { formatEuros } from "@/lib/money";
import { CosmeticShop } from "./CosmeticShop";

export function ShopScreen() {
  return <GameGate>{(game) => <Shop game={game} />}</GameGate>;
}

/** Le paiement en ligne n'est pas encore branché (Stripe, issue #48). */
const PAYMENT_NOTICE_ID = "paiement-bientot";

function Shop({ game }: { readonly game: ReadyGame }) {
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <ScreenHeader
        eyebrow="Boutique"
        title="Lingots, boosters et cosmétiques"
      />

      <section
        aria-labelledby="solde"
        className="panel flex items-center justify-between gap-4 p-4"
      >
        <h2 id="solde" className="eyebrow">
          Votre solde
        </h2>
        <IngotAmount amount={game.ingots} className="text-3xl" />
      </section>

      <section aria-labelledby="lingots" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="lingots" className="text-2xl font-bold">
            Lingots
          </h2>
          <p
            id={PAYMENT_NOTICE_ID}
            className="text-chalk-muted text-sm text-pretty"
          >
            Le paiement en ligne arrive bientôt. Les lingots achetés
            s&apos;ajoutent à ceux que vous gagnez, et s&apos;échangent contre
            des boosters.
          </p>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {INGOT_PACKS.map((pack) => (
            <li key={pack.id}>
              <IngotPackCard pack={pack} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="echange" className="flex flex-col gap-3">
        <h2 id="echange" className="text-2xl font-bold">
          Échanger des lingots
        </h2>
        <BoosterOffers game={game} disabled={false} />
      </section>

      <CosmeticShop game={game} />
    </div>
  );
}

function IngotPackCard({ pack }: { readonly pack: IngotPack }) {
  const boosters = boostersFor(pack);
  return (
    <article
      aria-label={`${pack.label} : ${pack.ingots} lingots pour ${formatEuros(pack.priceCents)}`}
      className="panel flex h-full flex-col gap-3 p-4"
    >
      <p className="eyebrow">{pack.label}</p>
      <IngotAmount amount={pack.ingots} className="text-2xl" />
      <p className="text-chalk-muted text-sm">
        {boosters} booster{boosters > 1 ? "s" : ""}, soit{" "}
        {formatEuros(boosterPriceCents(pack))} le booster
      </p>
      <Button
        variant="secondary"
        block
        disabled
        aria-describedby={PAYMENT_NOTICE_ID}
        className="mt-auto"
      >
        {formatEuros(pack.priceCents)}
      </Button>
    </article>
  );
}
