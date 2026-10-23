import { z } from "zod";
import type { Rng } from "@/lib/rng";
import { RARITIES, type Card, type Rarity } from "./card";
import type { Club } from "./club";

export const BOOSTER_SIZE = 5;

/** Probabilités de tirage par carte. La somme vaut 1. */
export const RARITY_ODDS: Record<Rarity, number> = {
  common: 0.7,
  rare: 0.22,
  epic: 0.07,
  legendary: 0.01,
};

export function rollRarity(rng: Rng): Rarity {
  const roll = rng();
  let cumulated = 0;
  for (const { id } of RARITIES) {
    cumulated += RARITY_ODDS[id];
    if (roll < cumulated) return id;
  }
  // Garde-fou contre les erreurs d'arrondi sur la somme des probabilités.
  return "common";
}

/**
 * Tire un booster : des clubs tous différents, chacun avec une rareté tirée
 * indépendamment de son niveau sportif.
 */
export function drawBooster(
  clubs: readonly Club[],
  rng: Rng,
  size = BOOSTER_SIZE,
): Card[] {
  if (clubs.length < size) {
    throw new Error(`Il faut au moins ${size} clubs pour composer un booster.`);
  }
  const pool = [...clubs];
  const cards: Card[] = [];
  for (let slot = 0; slot < size; slot += 1) {
    const index = Math.floor(rng() * pool.length);
    const [club] = pool.splice(index, 1);
    cards.push({ clubId: club.id, rarity: rollRarity(rng) });
  }
  return cards;
}

/** Nombre de boosters gratuits que la réserve d'un joueur peut contenir. */
export const MAX_FREE_BOOSTERS = 3;
/** Réserve des joueurs premium (offre à venir, hors V1). */
export const PREMIUM_MAX_FREE_BOOSTERS = 5;
const HOUR_MS = 60 * 60 * 1000;
/**
 * Un booster gratuit revient toutes les 8 heures, tant que la réserve n'est pas
 * pleine : un joueur gratuit en reçoit au plus 3 par jour.
 */
export const BOOSTER_REFILL_MS = 8 * HOUR_MS;

/**
 * Réserve de boosters gratuits : il y en avait `count` à l'instant `since`
 * (millisecondes Unix). Ce qui a été regagné depuis se calcule, sans minuteur.
 */
export const boosterReserveSchema = z.object({
  count: z.number().int().min(0).max(PREMIUM_MAX_FREE_BOOSTERS),
  since: z.number(),
});

export type BoosterReserve = z.infer<typeof boosterReserveSchema>;

/** Boosters regagnés depuis `reserve.since`, sans tenir compte du plafond. */
function refilledSince(reserve: BoosterReserve, now: number): number {
  return Math.max(0, Math.floor((now - reserve.since) / BOOSTER_REFILL_MS));
}

/**
 * Boosters gratuits disponibles à l'instant `now`, dans une réserve qui en
 * contient `max` au plus. Un nouveau joueur a une réserve pleine.
 */
export function freeBoosters(
  reserve: BoosterReserve | null,
  now: number,
  max = MAX_FREE_BOOSTERS,
): number {
  if (!reserve) return max;
  return Math.min(max, reserve.count + refilledSince(reserve, now));
}

/** Instant du prochain booster gratuit, ou `null` si la réserve est pleine. */
export function nextFreeBoosterAt(
  reserve: BoosterReserve | null,
  now: number,
  max = MAX_FREE_BOOSTERS,
): number | null {
  if (!reserve || freeBoosters(reserve, now, max) >= max) return null;
  return reserve.since + (refilledSince(reserve, now) + 1) * BOOSTER_REFILL_MS;
}

/** Retire un booster de la réserve ; lève une erreur si elle est vide. */
export function takeFreeBooster(
  reserve: BoosterReserve | null,
  now: number,
  max = MAX_FREE_BOOSTERS,
): BoosterReserve {
  const available = freeBoosters(reserve, now, max);
  if (available === 0) throw new BoosterQuotaExceededError();
  // Réserve pleine : le compte à rebours démarre maintenant. Sinon il continue
  // là où il en était, pour ne pas faire perdre le temps déjà attendu.
  const since =
    !reserve || available === max
      ? now
      : reserve.since + refilledSince(reserve, now) * BOOSTER_REFILL_MS;
  return { count: available - 1, since };
}

export class BoosterQuotaExceededError extends Error {
  constructor() {
    super("Plus de booster disponible pour le moment.");
    this.name = "BoosterQuotaExceededError";
  }
}
