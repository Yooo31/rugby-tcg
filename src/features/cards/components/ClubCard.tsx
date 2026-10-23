"use client";

import type { CSSProperties } from "react";
import {
  computePower,
  departmentName,
  getDivision,
  rarityLabel,
  type Club,
  type MatchResult,
  type Rarity,
} from "@/domain";
import { cn } from "@/lib/utils";
import { useCardTilt } from "../hooks/useCardTilt";
import styles from "./ClubCard.module.css";
import { ClubCrest } from "./ClubCrest";

const RESULT_LABELS: Record<
  MatchResult,
  { readonly letter: string; readonly name: string }
> = {
  W: { letter: "V", name: "victoire" },
  D: { letter: "N", name: "nul" },
  L: { letter: "D", name: "défaite" },
};

interface ClubCardProps {
  readonly club: Club;
  readonly rarity: Rarity;
  /** Active l'inclinaison 3D et les reflets au pointeur. */
  readonly interactive?: boolean;
  readonly className?: string;
}

/** Couleurs du club exposées en variables CSS pour la feuille de style de la carte. */
function clubColorVars(club: Club): CSSProperties {
  return {
    "--club-primary": club.colors.primary,
    "--club-secondary": club.colors.secondary,
  } as CSSProperties;
}

export function ClubCard({
  club,
  rarity,
  interactive = false,
  className,
}: ClubCardProps) {
  const { ref, handlers } = useCardTilt<HTMLElement>(interactive);
  const division = getDivision(club.division);
  const power = computePower(club);
  const form = club.recentResults
    .map((result) => RESULT_LABELS[result].name)
    .join(", ");

  return (
    <article
      ref={ref}
      {...handlers}
      data-rarity={rarity}
      aria-label={`${club.name}, ${division.label}, puissance ${power}, carte ${rarityLabel(rarity).toLowerCase()}`}
      className={cn(styles.card, interactive && styles.interactive, className)}
      style={clubColorVars(club)}
    >
      <div className={styles.tilt}>
        <div className={styles.frame}>
          <div className={styles.face}>
            <div className={styles.header}>
              <span className={styles.division}>{division.label}</span>
              <span className={styles.power}>
                <span className={styles.powerValue}>{power}</span>
                <span className={styles.powerLabel}>Puissance</span>
              </span>
            </div>

            <div className={styles.crest}>
              <ClubCrest club={club} />
            </div>

            <h3 className={styles.name}>{club.name}</h3>
            <p className={styles.locality}>
              {club.city} · {departmentName(club.department)}
            </p>

            <div className={styles.footer}>
              <ul
                className={styles.form}
                aria-label={
                  form ? `Forme récente : ${form}` : "Aucun résultat récent"
                }
              >
                {club.recentResults.map((result, index) => (
                  <li
                    key={index}
                    className={styles.result}
                    data-result={result}
                    aria-hidden
                  >
                    {RESULT_LABELS[result].letter}
                  </li>
                ))}
              </ul>
              <span className={styles.rarity}>{rarityLabel(rarity)}</span>
            </div>

            {rarity !== "common" ? (
              <div className={styles.foil} aria-hidden />
            ) : null}
            <div className={styles.glare} aria-hidden />
            {rarity === "legendary" ? (
              <div className={styles.sparkles} aria-hidden>
                <span />
                <span />
                <span />
                <span />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

/** Dos de carte, montré avant la révélation d'un booster. */
export function CardBack({ className }: { readonly className?: string }) {
  return (
    <div className={cn(styles.card, className)} aria-hidden>
      <div className={styles.frame}>
        <div className={cn(styles.face, styles.back)}>
          <span className={styles.backMark}>
            Rugby
            <br />
            TCG
          </span>
        </div>
      </div>
    </div>
  );
}

/** Emplacement d'une carte que le joueur ne possède pas encore. */
export function CardSlot({
  club,
  className,
}: {
  readonly club: Club;
  readonly className?: string;
}) {
  return (
    <article
      aria-label={`${club.name}, carte manquante`}
      className={cn(styles.card, styles.slot, className)}
      style={clubColorVars(club)}
    >
      <div className={styles.frame}>
        <div className={styles.face}>
          <div className={styles.crest}>
            <ClubCrest club={club} />
          </div>
          <h3 className={styles.name}>{club.name}</h3>
          <p className={styles.locality}>{getDivision(club.division).label}</p>
        </div>
      </div>
    </article>
  );
}
