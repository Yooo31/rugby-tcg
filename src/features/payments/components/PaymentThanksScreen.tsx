"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { ButtonLink } from "@/components/ui/button";
import { IngotAmount } from "@/components/ui/reward";
import { GameGate, type ReadyGame } from "@/features/game";

/** Le crédit arrive par le webhook, juste après le retour : on relit l'état. */
const REFRESH_EVERY_MS = 3_000;
const REFRESH_COUNT = 5;

export function PaymentThanksScreen() {
  return <GameGate>{(game) => <Thanks game={game} />}</GameGate>;
}

function Thanks({ game }: { readonly game: ReadyGame }) {
  const { refresh } = game;
  useEffect(() => {
    let count = 0;
    const timer = window.setInterval(() => {
      count += 1;
      void refresh();
      if (count >= REFRESH_COUNT) window.clearInterval(timer);
    }, REFRESH_EVERY_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return (
    <div className="flex flex-col gap-6">
      <ScreenHeader eyebrow="Boutique" title="Merci !" />
      <section className="panel flex flex-col gap-4 p-5">
        <CheckCircle2 aria-hidden className="text-pitch size-10" />
        <p className="text-pretty">
          Paiement reçu. Votre achat arrive sur votre compte dans quelques
          secondes ; Stripe vous envoie le reçu par e-mail.
        </p>
        <dl className="grid grid-cols-2 gap-3">
          <div>
            <dt className="eyebrow">Lingots</dt>
            <dd>
              <IngotAmount amount={game.ingots} className="text-2xl" />
            </dd>
          </div>
          <div>
            <dt className="eyebrow">Pass VIP</dt>
            <dd className="text-lg font-bold">
              {game.vip.isActive ? "Actif" : "Non"}
            </dd>
          </div>
        </dl>
        <p className="text-chalk-muted text-sm text-pretty">
          Rien après une minute ? Écrivez-nous depuis les mentions légales, avec
          l&apos;e-mail de reçu de Stripe : nous créditons ou remboursons.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/boosters">Ouvrir mes boosters</ButtonLink>
          <ButtonLink href="/boutique" variant="secondary">
            Retour à la boutique
          </ButtonLink>
        </div>
      </section>
    </div>
  );
}
