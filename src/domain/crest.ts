import { z } from "zod";

/**
 * Vocabulaire du blason généré d'un club : des éléments héraldiques
 * génériques. Le dessin vit dans `features/cards/lib/crest.ts` ; ici, seuls
 * les noms, pour qu'un club puisse choisir les siens (catalogue). Un blason
 * évoque le club sans jamais reprendre son logo (marque protégée).
 */
export const CREST_SHAPES = ["classic", "rounded", "notched"] as const;

export const CREST_PATTERNS = [
  "hoops",
  "sash",
  "chief",
  "pale",
  "quarterly",
  "chevron",
  "halves",
  /** Bandes verticales, comme le drapeau catalan. */
  "stripes",
] as const;

/** Symboles inspirés d'un lieu ou d'une tradition, jamais d'un logo. */
export const CREST_SYMBOLS = [
  "anchor",
  "ball",
  "bull",
  "crown",
  "cross",
  "ermine",
  "grapes",
  "mountain",
  "star",
  "sun",
  "tower",
  "tree",
  "volcano",
  "wave",
] as const;

export type CrestShape = (typeof CREST_SHAPES)[number];
export type CrestPattern = (typeof CREST_PATTERNS)[number];
export type CrestSymbol = (typeof CREST_SYMBOLS)[number];

/** Choix d'un club ; ce qui manque est tiré de son identifiant. */
export const crestStyleSchema = z.object({
  shape: z.enum(CREST_SHAPES).optional(),
  pattern: z.enum(CREST_PATTERNS).optional(),
  symbol: z.enum(CREST_SYMBOLS).optional(),
});
