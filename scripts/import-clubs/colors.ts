import { hashString } from "../../src/lib/rng";

export interface ClubColors {
  readonly primary: string;
  readonly secondary: string;
}

/**
 * Couleurs nommées dans les infobox Wikipédia. Les expressions de plusieurs
 * mots passent avant les mots simples (« bleu ciel » avant « bleu »).
 */
const NAMED_COLORS: readonly (readonly [name: string, hex: string])[] = [
  ["bleu ciel", "#6cace4"],
  ["bleu marine", "#0b2a5b"],
  ["bleu roi", "#0033a0"],
  ["ciel", "#6cace4"],
  ["sang", "#c8102e"],
  ["blanc", "#f5f5f5"],
  ["bleu", "#0055a4"],
  ["rouge", "#c8102e"],
  ["noir", "#111111"],
  ["jaune", "#ffd100"],
  ["vert", "#00843d"],
  ["grenat", "#7a1f3d"],
  ["bordeaux", "#7a1f3d"],
  ["violet", "#6a1b9a"],
  ["mauve", "#9b6bc9"],
  ["orange", "#ff6a13"],
  ["tango", "#ff6a13"],
  ["rose", "#e6007e"],
  ["gris", "#8a9aa6"],
  ["or", "#f2c14e"],
];

const WHITE = "#f5f5f5";
const BLACK = "#111111";

/**
 * Lit jusqu'à deux couleurs dans un texte comme « [[Rouge]] et [[noir]] ».
 * Un club d'une seule couleur reçoit du blanc (ou du noir) en seconde.
 */
export function parseColors(text: string): ClubColors | null {
  let remaining = text
    .toLowerCase()
    .replace(/<[^>]+>|\{\{[^}]*\}\}/g, " ")
    .replace(/\[\[[^\]|]*\|/g, " ")
    .replace(/[[\]]/g, " ");

  const found: { index: number; hex: string }[] = [];
  for (const [name, hex] of NAMED_COLORS) {
    const pattern = new RegExp(`(?<![a-zà-ÿ])${name}(?![a-zà-ÿ])`);
    let match = pattern.exec(remaining);
    while (match) {
      found.push({ index: match.index, hex });
      // On efface la couleur trouvée pour qu'un mot plus court ne la recompte pas.
      remaining =
        remaining.slice(0, match.index) +
        " ".repeat(name.length) +
        remaining.slice(match.index + name.length);
      match = pattern.exec(remaining);
    }
  }

  const ordered = found.sort((a, b) => a.index - b.index).map(({ hex }) => hex);
  const distinct = [...new Set(ordered)];
  if (distinct.length === 0) return null;
  const [primary, secondary = primary === WHITE ? BLACK : WHITE] = distinct;
  return { primary, secondary };
}

/** Paires de couleurs classiques des maillots de rugby, pour les clubs sans couleurs connues. */
const FALLBACK_PALETTE: readonly ClubColors[] = [
  { primary: "#c8102e", secondary: "#111111" },
  { primary: "#0055a4", secondary: "#f5f5f5" },
  { primary: "#00843d", secondary: "#f5f5f5" },
  { primary: "#ffd100", secondary: "#111111" },
  { primary: "#c8102e", secondary: "#f5f5f5" },
  { primary: "#0b2a5b", secondary: "#6cace4" },
  { primary: "#111111", secondary: "#f5f5f5" },
  { primary: "#0055a4", secondary: "#c8102e" },
  { primary: "#7a1f3d", secondary: "#6cace4" },
  { primary: "#00843d", secondary: "#ffd100" },
  { primary: "#ff6a13", secondary: "#111111" },
  { primary: "#6a1b9a", secondary: "#f5f5f5" },
];

/** Couleurs attribuées d'office, toujours les mêmes pour un club donné. */
export function fallbackColors(clubId: string): ClubColors {
  return FALLBACK_PALETTE[hashString(clubId) % FALLBACK_PALETTE.length];
}
