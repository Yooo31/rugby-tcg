"use client";

import { useId, type CSSProperties } from "react";
import {
  computePower,
  departmentName,
  getDivision,
  getSpecialCard,
  IS_RECENT_FORM_SHOWN,
  rarityLabel,
  DEFAULT_COSMETICS,
  type Club,
  type CosmeticIdOf,
  type MatchResult,
  type Rarity,
  type SpecialCardId,
} from "@/domain";
import { cn } from "@/lib/utils";
import { useCardTilt } from "../hooks/useCardTilt";
import { useEquippedCosmetics } from "./CardCosmetics";
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
  /** Cadre à montrer à la place de celui équipé (aperçu en boutique). */
  readonly frame?: CosmeticIdOf<"card-frame">;
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
  frame,
  className,
}: ClubCardProps) {
  const { ref, handlers } = useCardTilt<HTMLElement>(interactive);
  const equipped = useEquippedCosmetics();
  const shownFrame = frame ?? equipped["card-frame"];
  const division = getDivision(club.division);
  const power = computePower(club);

  return (
    <article
      ref={ref}
      {...handlers}
      data-rarity={rarity}
      // Le cadre est un liseré intérieur : la bordure de rareté reste intacte.
      data-frame={
        shownFrame === DEFAULT_COSMETICS["card-frame"] ? undefined : shownFrame
      }
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
              {IS_RECENT_FORM_SHOWN ? (
                <RecentForm results={club.recentResults} />
              ) : null}
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

/** Écu tricolore de la carte spéciale : couleurs nationales, sans coq ni logo. */
function TricolorCrest() {
  const clipId = useId();
  return (
    <svg viewBox="0 0 100 116" role="img" aria-hidden>
      <defs>
        <clipPath id={clipId}>
          <path d="M50 4 92 16V58C92 86 72 104 50 112 28 104 8 86 8 58V16Z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect width="34" height="116" fill="var(--color-france-blue)" />
        <rect x="34" width="32" height="116" fill="var(--color-france-white)" />
        <rect x="66" width="34" height="116" fill="var(--color-france-red)" />
      </g>
      <path
        d="M50 4 92 16V58C92 86 72 104 50 112 28 104 8 86 8 58V16Z"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M50 38 55.6 52.3 70.9 53.2 59 62.9 63 77.8 50 69.5 37 77.8 41 62.9 29.1 53.2 44.4 52.3Z"
        fill="var(--color-gold)"
        stroke="var(--color-gold-deep)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Carte spéciale, dorée : ni division, ni puissance, ni rareté tirée. Même
 * format et même inclinaison qu'une carte de club.
 */
export function SpecialCard({
  id,
  interactive = false,
  className,
}: {
  readonly id: SpecialCardId;
  readonly interactive?: boolean;
  readonly className?: string;
}) {
  const { ref, handlers } = useCardTilt<HTMLElement>(interactive);
  const card = getSpecialCard(id);

  return (
    <article
      ref={ref}
      {...handlers}
      data-special={id}
      aria-label={`${card.name}, ${card.caption.toLowerCase()}`}
      className={cn(
        styles.card,
        styles.special,
        interactive && styles.interactive,
        className,
      )}
    >
      <div className={styles.tilt}>
        <div className={styles.frame}>
          <div className={styles.face}>
            <div className={styles.header}>
              <span className={styles.division}>{card.caption}</span>
            </div>
            <div className={styles.crest}>
              <TricolorCrest />
            </div>
            <h3 className={styles.name}>{card.name}</h3>
            <p className={styles.locality}>France</p>
            <div className={styles.footer}>
              <span className={styles.rarity}>Or</span>
            </div>
            <div className={styles.foil} aria-hidden />
            <div className={styles.glare} aria-hidden />
            <div className={styles.sparkles} aria-hidden>
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/** Pastilles V / N / D des derniers matchs (masquées, voir `IS_RECENT_FORM_SHOWN`). */
export function RecentForm({
  results,
}: {
  readonly results: readonly MatchResult[];
}) {
  const form = results.map((result) => RESULT_LABELS[result].name).join(", ");
  return (
    <ul
      className={styles.form}
      aria-label={form ? `Forme récente : ${form}` : "Aucun résultat récent"}
    >
      {results.map((result, index) => (
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
  );
}

/** Dos de carte, montré avant la révélation d'un booster : celui équipé. */
export function CardBack({
  design,
  className,
}: {
  /** Dos à montrer à la place de celui équipé (aperçu en boutique). */
  readonly design?: CosmeticIdOf<"card-back">;
  readonly className?: string;
}) {
  const equipped = useEquippedCosmetics();
  return (
    <div
      className={cn(styles.card, className)}
      data-back={design ?? equipped["card-back"]}
      aria-hidden
    >
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
