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

export function totalCards(collection: Collection): number {
  return collection.reduce((total, owned) => total + owned.count, 0);
}

/** Exemplaires en trop (au-delà du premier), futurs candidats à l'échange. */
export function duplicateCount(collection: Collection): number {
  return totalCards(collection) - collection.length;
}

/** Ce qu'un joueur possède d'un club, toutes raretés confondues. */
export interface ClubHoldings {
  readonly clubId: string;
  /** Exemplaires par rareté obtenue ; une rareté absente n'est pas débloquée. */
  readonly copies: Readonly<Partial<Record<Rarity, number>>>;
  /** Rareté montrée par défaut (collection, albums). */
  readonly bestRarity: Rarity;
  readonly total: number;
  /** Date ISO de la dernière rareté débloquée pour ce club. */
  readonly lastUnlockedAt: string;
}

/** Regroupe la collection par club, dans l'ordre où les clubs apparaissent. */
export function holdingsByClub(
  collection: Collection,
): Map<string, ClubHoldings> {
  const holdings = new Map<string, ClubHoldings>();
  for (const { clubId, rarity, count, firstObtainedAt } of collection) {
    const current = holdings.get(clubId);
    holdings.set(
      clubId,
      current
        ? {
            clubId,
            copies: {
              ...current.copies,
              [rarity]: (current.copies[rarity] ?? 0) + count,
            },
            bestRarity:
              rarityRank(rarity) > rarityRank(current.bestRarity)
                ? rarity
                : current.bestRarity,
            total: current.total + count,
            lastUnlockedAt:
              firstObtainedAt > current.lastUnlockedAt
                ? firstObtainedAt
                : current.lastUnlockedAt,
          }
        : {
            clubId,
            copies: { [rarity]: count },
            bestRarity: rarity,
            total: count,
            lastUnlockedAt: firstObtainedAt,
          },
    );
  }
  return holdings;
}
