import { z } from "zod";
import {
  cardKey,
  cardSchema,
  rarityRank,
  type Card,
  type CardKey,
  type Rarity,
} from "./card";

/** Une carte possédée, avec son nombre d'exemplaires (les doublons s'empilent). */
export const ownedCardSchema = cardSchema.extend({
  count: z.number().int().min(1),
  /** Date ISO du premier exemplaire obtenu. */
  firstObtainedAt: z.string(),
});

export type OwnedCard = z.infer<typeof ownedCardSchema>;

export const collectionSchema = z.array(ownedCardSchema);
export type Collection = readonly OwnedCard[];

/** Carte tirée, enrichie de son statut par rapport à la collection d'avant tirage. */
export interface PulledCard extends Card {
  /** Première fois que le joueur obtient ce club, toutes raretés confondues. */
  readonly isNewClub: boolean;
  /** Première fois que le joueur obtient ce club dans cette rareté. */
  readonly isNewCard: boolean;
}

interface AddCardsResult {
  readonly collection: Collection;
  readonly pulled: readonly PulledCard[];
}

/** Ajoute des cartes à la collection sans muter l'entrée. */
export function addCards(
  collection: Collection,
  cards: readonly Card[],
  obtainedAt: string,
): AddCardsResult {
  const byKey = new Map<CardKey, OwnedCard>(
    collection.map((owned) => [cardKey(owned), owned]),
  );
  const knownClubs = ownedClubIds(collection);

  const pulled = cards.map((card): PulledCard => {
    const key = cardKey(card);
    const existing = byKey.get(key);
    byKey.set(
      key,
      existing
        ? { ...existing, count: existing.count + 1 }
        : { ...card, count: 1, firstObtainedAt: obtainedAt },
    );
    const isNewClub = !knownClubs.has(card.clubId);
    knownClubs.add(card.clubId);
    return { ...card, isNewClub, isNewCard: !existing };
  });

  return { collection: [...byKey.values()], pulled };
}

export function ownedClubIds(collection: Collection): Set<string> {
  return new Set(collection.map((owned) => owned.clubId));
}

/** Meilleure rareté possédée par club : c'est elle qu'on montre dans les albums. */
export function bestRarityByClub(collection: Collection): Map<string, Rarity> {
  const best = new Map<string, Rarity>();
  for (const { clubId, rarity } of collection) {
    const current = best.get(clubId);
    if (!current || rarityRank(rarity) > rarityRank(current))
      best.set(clubId, rarity);
  }
  return best;
}

export function totalCards(collection: Collection): number {
  return collection.reduce((total, owned) => total + owned.count, 0);
}

/** Exemplaires en trop (au-delà du premier), futurs candidats à l'échange. */
export function duplicateCount(collection: Collection): number {
  return totalCards(collection) - collection.length;
}
