import { z } from "zod";

/** Raretés, de la plus courante à la plus rare. L'ordre du tableau fait foi. */
export const RARITIES = [
  { id: "common", label: "Commune" },
  { id: "rare", label: "Rare" },
  { id: "epic", label: "Épique" },
  { id: "legendary", label: "Légendaire" },
] as const;

export type Rarity = (typeof RARITIES)[number]["id"];

const rarityIds = RARITIES.map((rarity) => rarity.id) as [Rarity, ...Rarity[]];
export const raritySchema = z.enum(rarityIds);

export function rarityLabel(rarity: Rarity): string {
  // RARITIES couvre tous les identifiants du type Rarity.
  return (
    RARITIES.find((entry) => entry.id === rarity) as (typeof RARITIES)[number]
  ).label;
}

/** Rang de rareté (0 = commune) pour trier et comparer. */
export function rarityRank(rarity: Rarity): number {
  return rarityIds.indexOf(rarity);
}

/**
 * Une carte = un club dans une rareté donnée. La rareté est fixée au tirage ;
 * la puissance, elle, vient du club et évolue avec ses résultats.
 */
export const cardSchema = z.object({
  clubId: z.string().min(1),
  rarity: raritySchema,
});

export type Card = z.infer<typeof cardSchema>;

export type CardKey = `${string}:${Rarity}`;

export function cardKey(card: Card): CardKey {
  return `${card.clubId}:${card.rarity}`;
}
