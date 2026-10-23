import { z } from "zod";
import {
  BoosterQuotaExceededError,
  freeBoosters,
  MAX_FREE_BOOSTERS,
  nextFreeBoosterAt,
  takeFreeBooster,
  type BoosterReserve,
} from "./booster";
import type { Reward } from "./reward";

/**
 * Offres de la boutique : des boosters contre des lingots. Le lot de 10 est
 * vendu 900 lingots au lieu de 1 000.
 */
export const BOOSTER_OFFERS = [
  { id: "single", boosters: 1, price: 100 },
  { id: "pack", boosters: 10, price: 900 },
] as const;

export type BoosterOffer = (typeof BOOSTER_OFFERS)[number];
export type BoosterOfferId = BoosterOffer["id"];

const UNIT_PRICE = BOOSTER_OFFERS[0].price;

/** Remise d'une offre par rapport à l'achat à l'unité, en pourcentage entier. */
export function offerDiscountPercent(offer: BoosterOffer): number {
  return Math.round((1 - offer.price / (offer.boosters * UNIT_PRICE)) * 100);
}

/**
 * Ce que possède le joueur en dehors de ses cartes : des lingots (la monnaie
 * du jeu) et des boosters bonus, qui s'ajoutent à la réserve gratuite sans plafond.
 */
export const walletSchema = z.object({
  ingots: z.number().int().min(0),
  bonusBoosters: z.number().int().min(0),
});

export type Wallet = z.infer<typeof walletSchema>;

export const EMPTY_WALLET: Wallet = { ingots: 0, bonusBoosters: 0 };

export function grantReward(wallet: Wallet, reward: Reward): Wallet {
  return {
    ingots: wallet.ingots + reward.ingots,
    bonusBoosters: wallet.bonusBoosters + reward.boosters,
  };
}

export function canAfford(wallet: Wallet, offer: BoosterOffer): boolean {
  return wallet.ingots >= offer.price;
}

/** Échange des lingots contre les boosters bonus d'une offre. */
export function buyBoosters(wallet: Wallet, offerId: BoosterOfferId): Wallet {
  // BOOSTER_OFFERS couvre tous les identifiants du type BoosterOfferId.
  const offer = BOOSTER_OFFERS.find(({ id }) => id === offerId) as BoosterOffer;
  if (!canAfford(wallet, offer)) throw new InsufficientIngotsError();
  return {
    ingots: wallet.ingots - offer.price,
    bonusBoosters: wallet.bonusBoosters + offer.boosters,
  };
}

export class InsufficientIngotsError extends Error {
  constructor() {
    super("Pas assez de lingots.");
    this.name = "InsufficientIngotsError";
  }
}

/** Boosters disponibles : les gratuits de la réserve, puis les bonus. */
export interface BoosterStock {
  readonly free: number;
  /** Taille de la réserve gratuite du joueur. */
  readonly max: number;
  readonly bonus: number;
  /** Instant (ms Unix) du prochain booster gratuit ; `null` si la réserve est pleine. */
  readonly nextFreeAt: number | null;
}

export function boosterStock(
  reserve: BoosterReserve | null,
  wallet: Wallet,
  now: number,
  max = MAX_FREE_BOOSTERS,
): BoosterStock {
  return {
    free: freeBoosters(reserve, now, max),
    max,
    bonus: wallet.bonusBoosters,
    nextFreeAt: nextFreeBoosterAt(reserve, now, max),
  };
}

interface BoosterSpending {
  readonly reserve: BoosterReserve | null;
  readonly wallet: Wallet;
  /** Réserve qui a payé l'ouverture. */
  readonly source: "free" | "bonus";
}

/**
 * Dépense un booster : un gratuit tant qu'il en reste (pour relancer le compte
 * à rebours au plus tôt), sinon un bonus. Lève une erreur s'il n'y en a aucun.
 */
export function spendBooster(
  reserve: BoosterReserve | null,
  wallet: Wallet,
  now: number,
  max = MAX_FREE_BOOSTERS,
): BoosterSpending {
  if (freeBoosters(reserve, now, max) > 0) {
    return {
      reserve: takeFreeBooster(reserve, now, max),
      wallet,
      source: "free",
    };
  }
  if (wallet.bonusBoosters > 0) {
    return {
      reserve,
      wallet: { ...wallet, bonusBoosters: wallet.bonusBoosters - 1 },
      source: "bonus",
    };
  }
  throw new BoosterQuotaExceededError();
}
