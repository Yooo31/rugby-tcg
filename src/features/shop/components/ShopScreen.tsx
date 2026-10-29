"use client";

import Link from "next/link";
import { ODDS_PATH, TERMS_OF_SALE_PATH } from "@/lib/supabase/routes";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ButtonLink } from "@/components/ui/button";
import { IngotAmount } from "@/components/ui/reward";
import { INGOT_PACKS, type IngotPack } from "@/domain";
import { BoosterOffers } from "@/features/boosters";
import { GameGate, type ReadyGame } from "@/features/game";
import { CheckoutButton } from "@/features/payments";
import { formatEuros } from "@/lib/money";
import { CosmeticShop } from "./CosmeticShop";

export function ShopScreen() {
  return <GameGate>{(game) => <Shop game={game} />}</GameGate>;
}

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

      <section
        aria-labelledby="vip"
        className="panel border-gold/40 flex flex-wrap items-center justify-between gap-4 p-5"
      >
        <div className="min-w-0 flex-1">
          <p className="eyebrow text-gold">Pass VIP</p>
          <h2 id="vip" className="text-2xl font-bold">
            {game.vip.isActive ? "Vous êtes VIP" : "5 boosters en réserve"}
          </h2>
          <p className="text-chalk-muted mt-1 text-sm text-pretty">
            Un booster de plus par jour et deux missions VIP.
          </p>
        </div>
        <ButtonLink href="/vip" variant="secondary">
          {game.vip.isActive ? "Mon pass" : "Découvrir"}
        </ButtonLink>
      </section>

      <section aria-labelledby="lingots" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="lingots" className="text-2xl font-bold">
            Lingots
          </h2>
          <p className="text-chalk-muted text-sm text-pretty">
            Les lingots achetés s&apos;ajoutent à ceux que vous gagnez, et
            s&apos;échangent contre des boosters. Voir les{" "}
            <Link
              href={TERMS_OF_SALE_PATH}
              className="underline underline-offset-2"
            >
              conditions de vente
            </Link>{" "}
            et les{" "}
            <Link href={ODDS_PATH} className="underline underline-offset-2">
              probabilités
            </Link>
            .
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

      <CosmeticShop game={game} />

      <section aria-labelledby="echange" className="flex flex-col gap-3">
        <h2 id="echange" className="text-2xl font-bold">
          Échanger des lingots
        </h2>
        <BoosterOffers game={game} disabled={false} />
      </section>
    </div>
  );
}

function IngotPackCard({ pack }: { readonly pack: IngotPack }) {
  return (
    <article
      aria-label={`${pack.label} : ${pack.ingots} lingots pour ${formatEuros(pack.priceCents)}`}
      className="panel flex h-full flex-col gap-3 p-4"
    >
      <p className="eyebrow">{pack.label}</p>
      <IngotAmount amount={pack.ingots} className="text-2xl" />
      <CheckoutButton
        product={{ kind: "ingots", id: pack.id }}
        className="mt-auto"
      />
    </article>
  );
}
