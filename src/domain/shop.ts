import { z } from "zod";
import { BOOSTER_OFFERS, type Wallet } from "./wallet";

/**
 * Paquets de lingots vendus en boutique (voir docs/economie.md, section
 * 3.2). Les lingots achetés et gagnés forment un seul solde ; un booster
 * coûte toujours 100 lingots. Les prix sont en centimes d'euro, TVA comprise.
 */
export const INGOT_PACKS = [
  { id: "handful", label: "Poignée", ingots: 200, priceCents: 199 },
  { id: "bag", label: "Sac", ingots: 650, priceCents: 599 },
  { id: "chest", label: "Coffre", ingots: 1_400, priceCents: 1_199 },
  { id: "trunk", label: "Malle", ingots: 3_000, priceCents: 2_499 },
] as const;

export type IngotPack = (typeof INGOT_PACKS)[number];
export type IngotPackId = IngotPack["id"];

export const ingotPackIdSchema = z.enum(
  INGOT_PACKS.map(({ id }) => id) as [IngotPackId, ...IngotPackId[]],
);

/** Prix d'un booster à l'unité, en lingots. */
const BOOSTER_PRICE = BOOSTER_OFFERS[0].price;

export function getIngotPack(id: IngotPackId): IngotPack {
  const pack = INGOT_PACKS.find((candidate) => candidate.id === id);
  if (!pack) throw new Error(`Paquet de lingots inconnu : ${id}`);
  return pack;
}

/** Boosters qu'un paquet permet d'acheter à l'unité. */
export function boostersFor(pack: IngotPack): number {
  return Math.floor(pack.ingots / BOOSTER_PRICE);
}

/** Ce que revient un booster acheté avec ce paquet, en centimes. */
export function boosterPriceCents(pack: IngotPack): number {
  return Math.round((pack.priceCents * BOOSTER_PRICE) / pack.ingots);
}

/** Crédite les lingots d'un paquet payé. */
export function creditIngotPack(wallet: Wallet, id: IngotPackId): Wallet {
  return { ...wallet, ingots: wallet.ingots + getIngotPack(id).ingots };
}
