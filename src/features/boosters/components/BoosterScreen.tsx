"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { Button } from "@/components/ui/button";
import { GameGate, type OpenedBooster, type ReadyGame } from "@/features/game";
import { BoosterPack } from "./BoosterPack";
import { BoosterReveal } from "./BoosterReveal";
import { BoosterSummary } from "./BoosterSummary";
import { BoosterOffers } from "./BoosterOffers";
import { BoosterPips } from "./BoosterPips";
import { NextBoosterCountdown } from "./NextBoosterCountdown";

type Phase =
  | { readonly step: "idle" }
  | { readonly step: "opening" }
  | { readonly step: "reveal"; readonly opened: OpenedBooster }
  | { readonly step: "summary"; readonly opened: OpenedBooster };

/** Durée de la secousse du sachet avant la révélation, en millisecondes. */
const TEAR_DURATION_MS = 700;

export function BoosterScreen() {
  return <GameGate>{(game) => <BoosterFlow game={game} />}</GameGate>;
}

function BoosterFlow({ game }: { readonly game: ReadyGame }) {
  const [phase, setPhase] = useState<Phase>({ step: "idle" });
  const [hasFailed, setHasFailed] = useState(false);
  const available = game.boosters.free + game.boosters.bonus;

  const open = async () => {
    setHasFailed(false);
    setPhase({ step: "opening" });
    try {
      const [opened] = await Promise.all([
        game.openBooster(),
        wait(TEAR_DURATION_MS),
      ]);
      setPhase({ step: "reveal", opened });
    } catch {
      setHasFailed(true);
      setPhase({ step: "idle" });
    }
  };

  if (phase.step === "reveal") {
    return (
      <BoosterReveal
        cards={phase.opened.cards}
        special={phase.opened.special}
        clubsById={game.clubsById}
        onDone={() => setPhase({ step: "summary", opened: phase.opened })}
      />
    );
  }

  if (phase.step === "summary") {
    return (
      <BoosterSummary
        cards={phase.opened.cards}
        special={phase.opened.special}
        clubsById={game.clubsById}
        remaining={available}
        onOpenAnother={open}
        onBack={() => setPhase({ step: "idle" })}
      />
    );
  }

  const isOpening = phase.step === "opening";
  const isSpent = available === 0 && !isOpening;

  return (
    <div className="flex flex-col gap-5 sm:gap-8">
      <ScreenHeader eyebrow="Boosters" title="Coup d'envoi">
        <BoosterPips stock={game.boosters} className="mb-2" />
      </ScreenHeader>

      <div className="flex flex-col items-center gap-5 sm:gap-8 sm:pt-2">
        <motion.div
          className="w-[min(13rem,26dvh)] sm:w-60"
          animate={
            isOpening
              ? {
                  rotate: [0, -6, 6, -8, 8, 0],
                  scale: [1, 1.04, 1.04, 1.08, 1.12, 0.2],
                  opacity: [1, 1, 1, 1, 1, 0],
                }
              : { rotate: 0, scale: 1, opacity: 1 }
          }
          transition={{ duration: TEAR_DURATION_MS / 1000, ease: "easeInOut" }}
        >
          <BoosterPack
            spent={isSpent}
            className={isSpent || isOpening ? undefined : "animate-float"}
          />
        </motion.div>

        <div className="flex w-full max-w-xs flex-col items-center gap-3 text-center">
          {isSpent ? (
            <h2 className="text-2xl font-bold">Réserve vide</h2>
          ) : (
            <Button size="lg" block onClick={open} disabled={isOpening}>
              {isOpening ? "Ouverture…" : "Ouvrir le booster"}
            </Button>
          )}

          <NextBoosterCountdown
            nextFreeAt={game.boosters.nextFreeAt}
            onElapsed={game.refresh}
          />
          {hasFailed ? (
            <p role="alert" className="text-danger text-sm">
              L&apos;ouverture a échoué. Réessayez.
            </p>
          ) : null}

          <BoosterOffers game={game} disabled={isOpening} />
          <Link
            href="/boutique"
            className="text-chalk-muted hover:text-chalk min-h-11 content-center text-sm underline-offset-4 hover:underline"
          >
            Plus de lingots ? La boutique
          </Link>
        </div>
      </div>
    </div>
  );
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
