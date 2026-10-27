"use client";

import { motion } from "motion/react";
import { Button, ButtonLink } from "@/components/ui/button";
import type { Club, PulledCard, PulledSpecialCard } from "@/domain";
import { ClubCard, SpecialCard } from "@/features/cards";
import { PulledCardBadge } from "./PulledCardBadge";

interface BoosterSummaryProps {
  readonly cards: readonly PulledCard[];
  readonly special?: PulledSpecialCard | null;
  readonly clubsById: ReadonlyMap<string, Club>;
  readonly remaining: number;
  readonly onOpenAnother: () => void;
  /** Retour à l'écran des boosters (réserve, boutique). */
  readonly onBack: () => void;
}

export function BoosterSummary({
  cards,
  special = null,
  clubsById,
  remaining,
  onOpenAnother,
  onBack,
}: BoosterSummaryProps) {
  const newClubs = cards.filter((card) => card.isNewClub).length;

  return (
    <div className="flex flex-col items-center gap-6 sm:gap-8">
      <div className="text-center">
        <h2 className="text-4xl font-extrabold">Essai transformé</h2>
        <p className="text-chalk-muted mt-2 text-sm">
          {newClubs > 0
            ? `${newClubs} nouveau${newClubs > 1 ? "x" : ""} club${newClubs > 1 ? "s" : ""} dans votre collection.`
            : "Que des doublons cette fois : ils serviront bientôt."}
        </p>
      </div>

      {special ? (
        <div className="flex flex-col items-center gap-2">
          <SpecialCard id={special.id} className="w-40" />
          <p className="text-rarity-legendary text-sm font-bold">
            Carte spéciale
          </p>
        </div>
      ) : null}

      <ul className="flex w-full flex-wrap justify-center gap-x-3 gap-y-5">
        {cards.map((card, index) => {
          const club = clubsById.get(card.clubId);
          if (!club) return null;
          return (
            <motion.li
              key={`${card.clubId}:${card.rarity}`}
              className="flex w-[calc(33.333%-0.5rem)] max-w-36 flex-col items-center gap-2 sm:w-36"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.07,
                duration: 0.4,
                ease: "easeOut",
              }}
            >
              <ClubCard club={club} rarity={card.rarity} />
              <PulledCardBadge card={card} />
            </motion.li>
          );
        })}
      </ul>

      <div className="flex w-full max-w-xs flex-col gap-2">
        {remaining > 0 ? (
          <Button size="lg" block onClick={onOpenAnother}>
            Ouvrir un autre ({remaining})
          </Button>
        ) : (
          // Plus de booster : on retourne à la boutique, jamais d'impasse.
          <Button size="lg" block onClick={onBack}>
            Retour aux boosters
          </Button>
        )}
        <ButtonLink href="/collection" variant="secondary" size="lg" block>
          Ma collection
        </ButtonLink>
      </div>
    </div>
  );
}
