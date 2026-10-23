"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { rarityLabel, type Club, type PulledCard, type Rarity } from "@/domain";
import { CardBack, ClubCard } from "@/features/cards";
import { cn } from "@/lib/utils";
import { PulledCardBadge } from "./PulledCardBadge";

const RARITY_HALO: Record<Rarity, string> = {
  common: "bg-rarity-common/20",
  rare: "bg-rarity-rare/40",
  epic: "bg-rarity-epic/50",
  legendary: "bg-rarity-legendary/60",
};

const RARITY_TEXT: Record<Rarity, string> = {
  common: "text-rarity-common",
  rare: "text-rarity-rare",
  epic: "text-rarity-epic",
  legendary: "text-rarity-legendary",
};

interface BoosterRevealProps {
  readonly cards: readonly PulledCard[];
  readonly clubsById: ReadonlyMap<string, Club>;
  readonly onDone: () => void;
}

/** Révèle les cartes une à une : chacune se retourne, dos puis face. */
export function BoosterReveal({
  cards,
  clubsById,
  onDone,
}: BoosterRevealProps) {
  const [index, setIndex] = useState(0);
  const card = cards[index];
  const club = clubsById.get(card.clubId);
  const isLast = index === cards.length - 1;

  if (!club) return null;

  return (
    <div className="flex flex-col items-center gap-4 sm:gap-6">
      <ol
        className="flex gap-2"
        aria-label={`Carte ${index + 1} sur ${cards.length}`}
      >
        {cards.map((_, step) => (
          <li
            key={step}
            className={cn(
              "h-1.5 w-8 rounded-full transition-colors",
              step <= index ? "bg-chalk" : "bg-white/15",
            )}
          />
        ))}
      </ol>

      <div className="relative grid w-full max-w-[min(16rem,36dvh)] place-items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="relative w-full"
            initial={{ opacity: 0, x: 60, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -60, scale: 0.9 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <motion.div
              aria-hidden
              className={cn(
                "absolute -inset-10 -z-10 rounded-full blur-3xl",
                RARITY_HALO[card.rarity],
              )}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.6 }}
            />
            <motion.div
              className="relative [transform-style:preserve-3d]"
              style={{ transformPerspective: 1000 }}
              initial={{ rotateY: 180 }}
              animate={{ rotateY: 0 }}
              transition={{
                delay: 0.2,
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <div className="[backface-visibility:hidden]">
                <ClubCard club={club} rarity={card.rarity} interactive />
              </div>
              <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden]">
                <CardBack />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div
        className="flex min-h-14 flex-col items-center gap-1.5"
        aria-live="polite"
      >
        <p
          className={cn(
            "font-display text-2xl font-bold tracking-wide uppercase",
            RARITY_TEXT[card.rarity],
          )}
        >
          {rarityLabel(card.rarity)}
        </p>
        <PulledCardBadge card={card} />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-2">
        <Button
          size="lg"
          block
          onClick={() => (isLast ? onDone() : setIndex(index + 1))}
        >
          {isLast ? "Voir le résumé" : "Carte suivante"}
        </Button>
        {isLast ? null : (
          <Button variant="ghost" block onClick={onDone}>
            Tout révéler
          </Button>
        )}
      </div>
    </div>
  );
}
