import { clubInitials, getDivision, type Club } from "@/domain";
import { hashString } from "@/lib/rng";
import { readableInkOn } from "./color";

/**
 * Dessin du blason généré, décrit en données : la carte (SVG React) et
 * l'image de partage (SVG en texte) le tracent à l'identique. Chaque club
 * reçoit toujours le même blason, tiré de son identifiant, de ses couleurs,
 * de son sigle et de sa division. Aucun logo officiel n'est utilisé.
 */

/** Repère du dessin : 100 × 116. */
export const CREST_VIEWBOX = "0 0 100 116";

const SHIELDS = {
  classic: "M50 4 92 16V58C92 86 72 104 50 112 28 104 8 86 8 58V16Z",
  rounded: "M8 6H92V60C92 90 72 106 50 112 28 106 8 90 8 60Z",
  notched: "M8 14 30 6H70L92 14V58C92 86 72 104 50 112 28 104 8 86 8 58Z",
} as const;

/** Motifs héraldiques, peints de la couleur secondaire sur le champ. */
const PATTERNS = {
  hoops: "M0 20H100V33H0Z M0 80H100V93H0Z",
  sash: "M-10 96 82 -6H110L18 122Z",
  chief: "M0 0H100V30H0Z",
  pale: "M38 0H62V116H38Z",
  quarterly: "M50 0H100V58H50Z M0 58H50V116H0Z",
  chevron: "M0 70 50 40 100 70V92L50 62 0 92Z",
  halves: "M50 0H100V116H50Z",
} as const;

type CrestShape = keyof typeof SHIELDS;
type CrestPattern = keyof typeof PATTERNS;

const SHAPE_IDS = Object.keys(SHIELDS) as CrestShape[];
const PATTERN_IDS = Object.keys(PATTERNS) as CrestPattern[];

/** Étoiles selon le niveau : 3 en Top 14, 2 en Pro D2, 1 en Nationale. */
const STARS_BY_TIER: Readonly<Record<number, number>> = { 1: 3, 2: 2, 3: 1 };

export interface CrestDesign {
  readonly shield: string;
  readonly pattern: string;
  readonly field: string;
  readonly charge: string;
  readonly ink: string;
  readonly initials: string;
  /** Une étoile par chemin, déjà placée. */
  readonly stars: readonly string[];
}

/** Étoile à cinq branches centrée en (cx, cy), de rayon r. */
export function starPath(cx: number, cy: number, r: number): string {
  const INNER_RATIO = 0.45;
  const points = Array.from({ length: 10 }, (_, index) => {
    const radius = index % 2 === 0 ? r : r * INNER_RATIO;
    const angle = -Math.PI / 2 + (index * Math.PI) / 5;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  });
  return `M${points.join("L")}Z`;
}

const STAR_Y = 24;
const STAR_RADIUS = 6;
const STAR_GAP = 15;

export function crestDesign(club: Club): CrestDesign {
  const hash = hashString(club.id);
  const shape = SHAPE_IDS[hash % SHAPE_IDS.length];
  const pattern =
    PATTERN_IDS[Math.floor(hash / SHAPE_IDS.length) % PATTERN_IDS.length];
  const starCount = STARS_BY_TIER[getDivision(club.division).tier] ?? 0;
  const firstStarX = 50 - ((starCount - 1) * STAR_GAP) / 2;

  return {
    shield: SHIELDS[shape],
    pattern: PATTERNS[pattern],
    field: club.colors.primary,
    charge: club.colors.secondary,
    ink: readableInkOn(club.colors.primary),
    initials: clubInitials(club.name),
    stars: Array.from({ length: starCount }, (_, index) =>
      starPath(firstStarX + index * STAR_GAP, STAR_Y, STAR_RADIUS),
    ),
  };
}

/**
 * Blason en SVG autonome, sans le sigle (ajouté par-dessus par l'appelant) :
 * pour l'image de partage, dont le moteur ne sait pas tracer le texte d'un SVG.
 */
export function crestSvgMarkup(design: CrestDesign): string {
  const stars = design.stars
    .map(
      (d) =>
        `<path d="${d}" fill="#fff" stroke="#0b131a" stroke-width="1.5" stroke-linejoin="round"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CREST_VIEWBOX}"><defs><clipPath id="c"><path d="${design.shield}"/></clipPath></defs><g clip-path="url(#c)"><rect width="100" height="116" fill="${design.field}"/><path d="${design.pattern}" fill="${design.charge}"/><rect width="50" height="116" fill="#000" opacity="0.12"/></g><path d="${design.shield}" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="3" stroke-linejoin="round"/>${stars}</svg>`;
}
