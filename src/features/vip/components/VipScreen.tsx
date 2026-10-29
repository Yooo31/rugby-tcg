"use client";

import Link from "next/link";
import { ODDS_PATH, TERMS_OF_SALE_PATH } from "@/lib/supabase/routes";
import { Check, Crown } from "lucide-react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import {
  DAILY_MISSION_COUNT,
  MAX_FREE_BOOSTERS,
  VIP_MAX_FREE_BOOSTERS,
  VIP_MISSION_COUNT,
  VIP_OFFERS,
  type VipOffer,
} from "@/domain";
import { GameGate, type ReadyGame } from "@/features/game";
import { formatEuros } from "@/lib/money";
import { VIP_DATE_FORMAT } from "../lib/format";

export function VipScreen() {
  return <GameGate>{(game) => <Vip game={game} />}</GameGate>;
}

/** Le paiement en ligne n'est pas encore branché (Stripe, issue #48). */
const PAYMENT_NOTICE_ID = "vip-paiement-bientot";

/** Avantages du pass, comparés au jeu gratuit. */
const ADVANTAGES = [
  {
    label: "Réserve de boosters gratuits",
    free: `${MAX_FREE_BOOSTERS}`,
    vip: `${VIP_MAX_FREE_BOOSTERS}`,
  },
  { label: "Booster VIP du jour", free: "—", vip: "+1 par jour" },
  {
    label: "Missions du jour",
    free: `${DAILY_MISSION_COUNT}`,
    vip: `${DAILY_MISSION_COUNT + VIP_MISSION_COUNT}, dont ${VIP_MISSION_COUNT} VIP`,
  },
  { label: "Badge VIP au classement", free: "—", vip: "Oui" },
] as const;

/** Économie de l'offre annuelle par rapport à douze mois. */
function yearlySaving(): number {
  const [month, year] = VIP_OFFERS;
  return Math.round((1 - year.priceCents / (month.priceCents * 12)) * 100);
}

function Vip({ game }: { readonly game: ReadyGame }) {
  const { vip } = game;
  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <ScreenHeader eyebrow="Pass VIP" title="Jouez en VIP" />

      <section
        aria-labelledby="vip-statut"
        className="panel border-gold/40 flex items-center gap-4 p-5"
      >
        <Crown
          aria-hidden
          className={
            vip.isActive ? "text-gold size-8" : "text-chalk-faint size-8"
          }
        />
        <div className="min-w-0">
          <h2 id="vip-statut" className="text-2xl font-extrabold">
            {vip.isActive ? "Vous êtes VIP" : "Pas encore VIP"}
          </h2>
          <p className="text-chalk-muted mt-1 text-sm text-pretty">
            {vip.isActive && vip.until !== null
              ? `Jusqu'au ${VIP_DATE_FORMAT.format(vip.until)}.`
              : "Sans engagement : les avantages cessent à la fin de la période payée, vos cartes restent."}
          </p>
        </div>
      </section>

      <section aria-labelledby="vip-avantages" className="flex flex-col gap-3">
        <h2 id="vip-avantages" className="text-2xl font-bold">
          Avantages
        </h2>
        <div className="panel overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-chalk-muted">
              <tr>
                <th scope="col" className="p-3 font-medium">
                  <span className="sr-only">Avantage</span>
                </th>
                <th scope="col" className="p-3 font-medium">
                  Gratuit
                </th>
                <th scope="col" className="text-gold p-3 font-bold">
                  VIP
                </th>
              </tr>
            </thead>
            <tbody>
              {ADVANTAGES.map((advantage) => (
                <tr key={advantage.label} className="border-line border-t">
                  <th scope="row" className="p-3 font-medium">
                    {advantage.label}
                  </th>
                  <td className="text-chalk-muted p-3 tabular-nums">
                    {advantage.free}
                  </td>
                  <td className="text-gold p-3 font-bold tabular-nums">
                    {advantage.vip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="vip-offres" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h2 id="vip-offres" className="text-2xl font-bold">
            {vip.isActive ? "Prolonger" : "S'abonner"}
          </h2>
          <p
            id={PAYMENT_NOTICE_ID}
            className="text-chalk-muted text-sm text-pretty"
          >
            Le paiement en ligne arrive bientôt. Voir les{" "}
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
        <ul className="grid gap-3 sm:grid-cols-2">
          {VIP_OFFERS.map((offer) => (
            <li key={offer.id}>
              <VipOfferCard offer={offer} />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function VipOfferCard({ offer }: { readonly offer: VipOffer }) {
  const isYearly = offer.id === "vip-year";
  return (
    <article
      aria-label={`${offer.label} de pass VIP pour ${formatEuros(offer.priceCents)}`}
      className="panel flex h-full flex-col gap-3 p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="eyebrow">{offer.label}</p>
        {isYearly ? (
          <p className="text-pitch flex items-center gap-1 text-xs font-bold">
            <Check aria-hidden className="size-3" />
            {yearlySaving()} % d&apos;économie
          </p>
        ) : null}
      </div>
      <p className="font-display text-3xl font-bold tabular-nums">
        {formatEuros(offer.priceCents)}
      </p>
      <Button
        variant="secondary"
        block
        disabled
        aria-describedby={PAYMENT_NOTICE_ID}
        className="mt-auto"
      >
        Bientôt disponible
      </Button>
    </article>
  );
}
