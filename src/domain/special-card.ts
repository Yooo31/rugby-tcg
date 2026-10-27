import { z } from "zod";
import type { Rng } from "@/lib/rng";

/**
 * Cartes spéciales : hors des clubs, donc sans division, sans puissance, sans
 * rareté tirée et sans album. Elles ont leur propre style (doré) et ne comptent
 * pas au classement, qui reste celui des clubs différents.
 */
export const SPECIAL_CARDS = [
  {
    id: "equipe-de-france",
    name: "Équipe de France",
    /** Ce qu'affiche la carte sous le nom. */
    caption: "Carte spéciale",
  },
] as const;

export type SpecialCard = (typeof SPECIAL_CARDS)[number];
export type SpecialCardId = SpecialCard["id"];

const specialCardIdSchema = z.enum(
  SPECIAL_CARDS.map(({ id }) => id) as [SpecialCardId, ...SpecialCardId[]],
);

/**
 * Chance qu'un booster contienne une carte spéciale, en plus de ses cartes de
 * club : une sur cent mille. Elle doit rester un évènement.
 */
export const SPECIAL_CARD_ODDS = 1 / 100_000;

export const ownedSpecialCardSchema = z.object({
  id: specialCardIdSchema,
  count: z.number().int().min(1),
  /** Date ISO du premier exemplaire obtenu. */
  firstObtainedAt: z.string(),
});

export type OwnedSpecialCard = z.infer<typeof ownedSpecialCardSchema>;
export type SpecialCollection = readonly OwnedSpecialCard[];

/** Carte spéciale tirée avec un booster, et si le joueur l'avait déjà. */
export interface PulledSpecialCard {
  readonly id: SpecialCardId;
  readonly isNew: boolean;
}

export function getSpecialCard(id: SpecialCardId): SpecialCard {
  const card = SPECIAL_CARDS.find((candidate) => candidate.id === id);
  if (!card) throw new Error(`Carte spéciale inconnue : ${id}`);
  return card;
}

/** Tire au sort la carte spéciale d'un booster ; le plus souvent, aucune. */
export function rollSpecialCard(rng: Rng): SpecialCardId | null {
  if (rng() >= SPECIAL_CARD_ODDS) return null;
  return SPECIAL_CARDS[Math.floor(rng() * SPECIAL_CARDS.length)].id;
}

/** Range une carte spéciale : les exemplaires s'empilent, sans muter l'entrée. */
export function addSpecialCard(
  collection: SpecialCollection,
  id: SpecialCardId,
  obtainedAt: string,
): {
  readonly collection: SpecialCollection;
  readonly pulled: PulledSpecialCard;
} {
  const existing = collection.find((owned) => owned.id === id);
  return {
    collection: existing
      ? collection.map((owned) =>
          owned.id === id ? { ...owned, count: owned.count + 1 } : owned,
        )
      : [...collection, { id, count: 1, firstObtainedAt: obtainedAt }],
    pulled: { id, isNew: !existing },
  };
}
