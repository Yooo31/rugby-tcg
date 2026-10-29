import {
  clubInitials,
  CREST_PATTERNS,
  CREST_SHAPES,
  getDivision,
  type Club,
  type CrestPattern,
  type CrestShape,
  type CrestSymbol,
} from "@/domain";
import { hashString } from "@/lib/rng";
import { readableInkOn } from "./color";

/**
 * Dessin du blason généré, décrit en données : la carte (SVG React) et
 * l'image de partage (SVG en texte) le tracent à l'identique. Forme, motif et
 * symbole viennent du catalogue quand le club les a (`club.crest`), sinon de
 * son identifiant : chaque club garde toujours le même blason. Aucun logo
 * officiel n'est utilisé, ni imité.
 */

/** Repère du dessin : 100 × 116. */
export const CREST_VIEWBOX = "0 0 100 116";

const SHIELDS: Readonly<Record<CrestShape, string>> = {
  classic: "M50 4 92 16V58C92 86 72 104 50 112 28 104 8 86 8 58V16Z",
  rounded: "M8 6H92V60C92 90 72 106 50 112 28 106 8 90 8 60Z",
  notched: "M8 14 30 6H70L92 14V58C92 86 72 104 50 112 28 104 8 86 8 58Z",
};

/** Motifs héraldiques, peints de la couleur secondaire sur le champ. */
const PATTERNS: Readonly<Record<CrestPattern, string>> = {
  hoops: "M0 20H100V33H0Z M0 80H100V93H0Z",
  sash: "M-10 96 82 -6H110L18 122Z",
  chief: "M0 0H100V30H0Z",
  pale: "M38 0H62V116H38Z",
  quarterly: "M50 0H100V58H50Z M0 58H50V116H0Z",
  chevron: "M0 70 50 40 100 70V92L50 62 0 92Z",
  halves: "M50 0H100V116H50Z",
  stripes:
    "M14 0H24V116H14Z M34 0H44V116H34Z M56 0H66V116H56Z M76 0H86V116H76Z",
};

/** Motifs tirés au hasard : les bandes catalanes restent un choix explicite. */
const RANDOM_PATTERNS = CREST_PATTERNS.filter(
  (pattern) => pattern !== "stripes",
);

/** Centre et rayon des symboles, sous les étoiles et au-dessus du sigle. */
const SYMBOL_CX = 50;
const SYMBOL_CY = 62;

/** Cercle en chemin SVG (deux demi-arcs), pour l'assembler aux autres formes. */
function circlePath(cx: number, cy: number, r: number): string {
  return `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;
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

/** Soleil : un disque et huit rayons triangulaires. */
function sunPath(cx: number, cy: number): string {
  const DISC = 10;
  const RAY_START = 13;
  const RAY_END = 21;
  const RAY_HALF_ANGLE = 0.2;
  const point = (radius: number, angle: number) =>
    `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  const rays = Array.from({ length: 8 }, (_, index) => {
    const angle = (index * Math.PI) / 4;
    return `M${point(RAY_START, angle - RAY_HALF_ANGLE)}L${point(RAY_END, angle)}L${point(RAY_START, angle + RAY_HALF_ANGLE)}Z`;
  });
  return `${circlePath(cx, cy, DISC)} ${rays.join(" ")}`;
}

export interface SymbolDrawing {
  /** Chemin principal, peint de la couleur d'encre. */
  readonly d: string;
  /** `stroke` : tracé en trait épais (ancre, vagues) plutôt que rempli. */
  readonly mode: "fill" | "stroke";
  /** Détails tracés par-dessus, de la couleur du champ (coutures, porte…). */
  readonly detail?: string;
}

/** Symboles génériques, dessinés dans le carré 26–74 × 38–86. */
const SYMBOLS: Readonly<Record<CrestSymbol, SymbolDrawing>> = {
  anchor: {
    mode: "stroke",
    d: "M50 44a4 4 0 1 0 0.01 0 M50 48V81 M40 55H60 M31 66Q33 81 50 81Q67 81 69 66 M27 69l4-4 4 4 M65 69l4-4 4 4",
  },
  ball: {
    mode: "fill",
    d: "M32 74.6A22 13 -35 0 1 68 49.4A22 13 -35 0 1 32 74.6Z",
    detail: "M39 70 61 54 M45 61.5l3 4 M49 58.6l3 4 M53 55.7l3 4",
  },
  bull: {
    mode: "fill",
    d: "M41 52H59L57 72Q50 81 43 72Z M42 54C32 54 26 47 26 39 32 45 38 47 45 49Z M58 54C68 54 74 47 74 39 68 45 62 47 55 49Z",
  },
  crown: {
    mode: "fill",
    d: "M29 78V50L39 61 50 44 61 61 71 50V78Z",
    detail: "M29 71H71",
  },
  cross: {
    mode: "fill",
    d: "M43 41H57L53 58 70 54V70L53 66 57 83H43L47 66 30 70V54L47 58Z",
  },
  ermine: {
    mode: "fill",
    d: `${circlePath(43, 47, 3.5)} ${circlePath(50, 42, 3.5)} ${circlePath(57, 47, 3.5)} M50 50C48 61 41 71 36 82L44 77 50 84 56 77 64 82C59 71 52 61 50 50Z`,
  },
  grapes: {
    mode: "fill",
    d: `${[
      [39, 52],
      [50, 52],
      [61, 52],
      [44.5, 62],
      [55.5, 62],
      [50, 72],
    ]
      .map(([cx, cy]) => circlePath(cx, cy, 6))
      .join(" ")} M50 46C51 39 59 36 66 38 62 45 56 47 50 46Z`,
  },
  mountain: {
    mode: "fill",
    d: "M25 80 42 50 49 61 58 44 76 80Z",
  },
  star: { mode: "fill", d: starPath(SYMBOL_CX, SYMBOL_CY + 1, 22) },
  sun: { mode: "fill", d: sunPath(SYMBOL_CX, SYMBOL_CY) },
  tower: {
    mode: "fill",
    d: "M34 82V44H41V50H46V44H54V50H59V44H66V82H55V73A5 5 0 0 0 45 73V82Z",
  },
  tree: {
    mode: "fill",
    d: `${circlePath(41, 58, 10)} ${circlePath(59, 58, 10)} ${circlePath(50, 47, 12)} M46 62H54V82H46Z`,
  },
  volcano: {
    mode: "fill",
    d: "M24 82 41 50H45L50 57 55 50H59L76 82Z",
    detail: "M50 61V68 M44 74 47 66 M56 74 53 66",
  },
  wave: {
    mode: "stroke",
    d: "M27 54q5.75-7 11.5 0t11.5 0 11.5 0 11.5 0 M27 70q5.75-7 11.5 0t11.5 0 11.5 0 11.5 0",
  },
};

/** Étoiles selon le niveau : 3 en Top 14, 2 en Pro D2, 1 en Nationale. */
const STARS_BY_TIER: Readonly<Record<number, number>> = { 1: 3, 2: 2, 3: 1 };

const STAR_Y = 24;
const STAR_RADIUS = 6;
const STAR_GAP = 15;

/** Place et taille du sigle, en unités du repère. */
interface InitialsLayout {
  readonly y: number;
  readonly size: number;
}

/** Sigle au cœur du blason quand il n'y a pas de symbole… */
const CENTER_INITIALS = { withStars: 66, withoutStars: 60, size: 38 };
/** …sinon plus petit, dans la pointe, sous le symbole. */
const FOOT_INITIALS = { y: 92, size: 14 };
/** Sigle de trois lettres ou plus : un peu plus petit, pour tenir. */
const LONG_INITIALS_RATIO = 0.72;
/** Sigle de quatre signes : plus petit encore. */
const LONGEST_INITIALS_RATIO = 0.56;

export interface CrestDesign {
  readonly shield: string;
  readonly pattern: string;
  readonly field: string;
  readonly charge: string;
  /** Liseré intérieur d'un club tricolore, sinon `null`. */
  readonly trim: string | null;
  readonly ink: string;
  readonly initials: string;
  readonly initialsLayout: InitialsLayout;
  /** Une étoile par chemin, déjà placée. */
  readonly stars: readonly string[];
  readonly symbol: SymbolDrawing | null;
}

function initialsLayout(
  initials: string,
  hasStars: boolean,
  hasSymbol: boolean,
): InitialsLayout {
  const ratio =
    initials.length > 3
      ? LONGEST_INITIALS_RATIO
      : initials.length > 2
        ? LONG_INITIALS_RATIO
        : 1;
  if (hasSymbol)
    return { y: FOOT_INITIALS.y, size: FOOT_INITIALS.size * ratio };
  return {
    y: hasStars ? CENTER_INITIALS.withStars : CENTER_INITIALS.withoutStars,
    size: CENTER_INITIALS.size * ratio,
  };
}

export function crestDesign(club: Club): CrestDesign {
  const hash = hashString(club.id);
  const shape = club.crest?.shape ?? CREST_SHAPES[hash % CREST_SHAPES.length];
  const pattern =
    club.crest?.pattern ??
    RANDOM_PATTERNS[
      Math.floor(hash / CREST_SHAPES.length) % RANDOM_PATTERNS.length
    ];
  const symbol = club.crest?.symbol ? SYMBOLS[club.crest.symbol] : null;
  const starCount = STARS_BY_TIER[getDivision(club.division).tier] ?? 0;
  const firstStarX = 50 - ((starCount - 1) * STAR_GAP) / 2;
  const initials = club.initials ?? clubInitials(club.name);

  return {
    shield: SHIELDS[shape],
    pattern: PATTERNS[pattern],
    field: club.colors.primary,
    charge: club.colors.secondary,
    trim: club.colors.tertiary ?? null,
    ink: readableInkOn(club.colors.primary),
    initials,
    initialsLayout: initialsLayout(initials, starCount > 0, symbol !== null),
    stars: Array.from({ length: starCount }, (_, index) =>
      starPath(firstStarX + index * STAR_GAP, STAR_Y, STAR_RADIUS),
    ),
    symbol,
  };
}

/**
 * Liseré d'un club tricolore : un trait sur le bord de l'écu, coupé par le
 * contour, dont seule la moitié intérieure reste visible.
 */
export const TRIM_WIDTH = 6;

/**
 * Les symboles sont dessinés dans le carré 26–74 × 38–86 ; on les réduit
 * autour de leur centre pour qu'ils restent loin des bords de l'écu, quelle
 * que soit sa forme, et ne touchent ni les étoiles ni le sigle.
 */
export const SYMBOL_TRANSFORM =
  "translate(50 60) scale(0.74) translate(-50 -62)";

/** Épaisseurs des traits du symbole : le contour le détache du motif. */
const SYMBOL_STROKE = 6;
const SYMBOL_OUTLINE = 3;
const DETAIL_STROKE = 2.5;

/**
 * Le symbole, en attributs SVG : un contour de la couleur du champ, puis le
 * symbole à l'encre, puis ses détails. Partagé par la carte et le partage.
 */
export function symbolLayers(design: CrestDesign): {
  readonly d: string;
  readonly fill: string;
  readonly stroke: string;
  readonly strokeWidth: number;
}[] {
  const { symbol, ink, field } = design;
  if (!symbol) return [];
  const stroked = symbol.mode === "stroke";
  const layers = [
    {
      d: symbol.d,
      fill: stroked ? "none" : field,
      stroke: field,
      strokeWidth: (stroked ? SYMBOL_STROKE : 0) + SYMBOL_OUTLINE * 2,
    },
    {
      d: symbol.d,
      fill: stroked ? "none" : ink,
      stroke: stroked ? ink : "none",
      strokeWidth: stroked ? SYMBOL_STROKE : 0,
    },
  ];
  if (symbol.detail)
    layers.push({
      d: symbol.detail,
      fill: "none",
      stroke: field,
      strokeWidth: DETAIL_STROKE,
    });
  return layers;
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
  const symbol = symbolLayers(design)
    .map(
      ({ d, fill, stroke, strokeWidth }) =>
        `<path d="${d}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${CREST_VIEWBOX}"><defs><clipPath id="c"><path d="${design.shield}"/></clipPath></defs><g clip-path="url(#c)"><rect width="100" height="116" fill="${design.field}"/><path d="${design.pattern}" fill="${design.charge}"/><rect width="50" height="116" fill="#000" opacity="0.12"/><g transform="${SYMBOL_TRANSFORM}">${symbol}</g>${design.trim ? `<path d="${design.shield}" fill="none" stroke="${design.trim}" stroke-width="${TRIM_WIDTH}"/>` : ""}</g><path d="${design.shield}" fill="none" stroke="#fff" stroke-opacity="0.85" stroke-width="3" stroke-linejoin="round"/>${stars}</svg>`;
}
