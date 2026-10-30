"use client";

import Link from "next/link";
import { ODDS_PATH, TERMS_OF_SALE_PATH } from "@/lib/supabase/routes";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ButtonLink } from "@/components/ui/button";
import { IngotAmount } from "@/components/ui/reward";
import {
  bestPack,
  INGOT_PACKS,
  packBonusPercent,
  productPrice,
  type IngotPack,
  type Promotion,
} from "@/domain";
import { BoosterOffers } from "@/features/boosters";
import { GameGate, type ReadyGame } from "@/features/game";
import { CheckoutButton } from "@/features/payments";
import { formatEuros } from "@/lib/money";
import { cn } from "@/lib/utils";
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

      {game.promotion ? <PromotionBanner promotion={game.promotion} /> : null}

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
            Un booster sans commune toutes les 48 h et deux missions VIP.
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
              <IngotPackCard pack={pack} promotion={game.promotion} />
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

/** Paquet au meilleur bonus, mis en avant. */
const BEST_PACK_ID = bestPack().id;

function IngotPackCard({
  pack,
  promotion,
}: {
  readonly pack: IngotPack;
  readonly promotion: Promotion | null;
}) {
  const bonus = packBonusPercent(pack);
  const isBest = pack.id === BEST_PACK_ID;
  return (
    <article
      aria-label={`${pack.label} : ${pack.ingots} lingots pour ${formatEuros(productPrice({ kind: "ingots", id: pack.id }, promotion).priceCents)}`}
      className={cn(
        "panel relative flex h-full flex-col gap-3 p-4",
        isBest && "border-gold/60",
      )}
    >
      {isBest ? (
        <p className="bg-gold text-night absolute -top-2.5 right-3 rounded-full px-2 py-0.5 text-xs font-bold">
          Meilleure offre
        </p>
      ) : null}
      <p className="eyebrow">{pack.label}</p>
      <IngotAmount amount={pack.ingots} className="text-2xl" />
      {bonus > 0 ? (
        <p className="text-pitch text-sm font-bold">+{bonus} % de lingots</p>
      ) : null}
      <CheckoutButton
        product={{ kind: "ingots", id: pack.id }}
        promotion={promotion}
        className="mt-auto"
      />
    </article>
  );
}

const PROMOTION_END = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  timeZone: "Europe/Paris",
});

/** Promotion en cours : vraie baisse de prix, jusqu'à sa date de fin. */
function PromotionBanner({ promotion }: { readonly promotion: Promotion }) {
  // La fin est exclue : le dernier jour est la veille de `endsAt`.
  // « 1er novembre », comme on l'écrit en français.
  const lastDay = PROMOTION_END.format(promotion.endsAt - 1).replace(
    /^1 /,
    "1er ",
  );
  return (
    <section
      aria-labelledby="promotion"
      className="panel border-gold/60 flex flex-col gap-1 p-5"
    >
      <p className="eyebrow text-gold">Promotion</p>
      <h2 id="promotion" className="text-2xl font-extrabold">
        {promotion.title} : −{promotion.percentOff} %
      </h2>
      <p className="text-chalk-muted text-sm text-pretty">
        Sur tous les achats en euros, jusqu&apos;au {lastDay} inclus.
      </p>
    </section>
  );
}
