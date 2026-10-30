import { Gift } from "lucide-react";
import { WELCOME_OFFER } from "@/domain";
import { CheckoutButton } from "./CheckoutButton";

/**
 * Offre de bienvenue, une seule fois par compte : rien à montrer une fois
 * prise. Pas de promotion en plus : elle a déjà son petit prix.
 */
export function WelcomeOfferCard({
  isAvailable,
}: {
  readonly isAvailable: boolean;
}) {
  if (!isAvailable) return null;
  return (
    <section
      aria-labelledby="bienvenue"
      className="panel border-gold/60 flex flex-wrap items-center gap-4 p-5"
    >
      <Gift aria-hidden className="text-gold size-8 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="eyebrow text-gold">Une seule fois</p>
        <h2 id="bienvenue" className="text-2xl font-extrabold">
          {WELCOME_OFFER.label}
        </h2>
        <p className="text-chalk-muted mt-1 text-sm text-pretty">
          {WELCOME_OFFER.ingots} lingots et {WELCOME_OFFER.vipDays} jours de
          pass VIP : 5 boosters en réserve, un booster VIP, deux missions de
          plus.
        </p>
      </div>
      <CheckoutButton
        product={{ kind: "welcome", id: WELCOME_OFFER.id }}
        variant="primary"
        className="w-full sm:w-auto"
      />
    </section>
  );
}
