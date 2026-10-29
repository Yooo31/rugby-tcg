"use client";

import { AsyncButton } from "@/components/ui/async-button";
import { IngotAmount } from "@/components/ui/reward";
import { BOOSTER_OFFERS, canAfford, offerDiscountPercent } from "@/domain";
import type { ReadyGame } from "@/features/game";

/** Boutique : un booster ou un lot de dix, contre des lingots. */
export function BoosterOffers({
  game,
  disabled,
}: {
  readonly game: ReadyGame;
  readonly disabled: boolean;
}) {
  const wallet = { ingots: game.ingots, bonusBoosters: game.boosters.bonus };

  return (
    <div className="grid w-full grid-cols-2 gap-2">
      {BOOSTER_OFFERS.map((offer) => {
        const discount = offerDiscountPercent(offer);
        return (
          <AsyncButton
            key={offer.id}
            variant="secondary"
            onAction={() => game.buyBoosters(offer.id)}
            disabled={disabled || !canAfford(wallet, offer)}
            className="relative min-h-16 flex-col gap-0.5 px-2"
          >
            <span className="text-base">
              +{offer.boosters} booster{offer.boosters > 1 ? "s" : ""}
            </span>
            <IngotAmount amount={offer.price} />
            {discount > 0 ? (
              <span className="bg-gold text-night absolute -top-2 right-2 rounded-full px-2 text-xs leading-5">
                −{discount} %
              </span>
            ) : null}
          </AsyncButton>
        );
      })}
    </div>
  );
}
