import { z } from "zod";
import type { Wallet } from "./wallet";

/**
 * Paquets de lingots vendus en boutique (voir docs/economie.md, section
 * 3.2). Les lingots achetés et gagnés forment un seul solde ; un booster
 * coûte toujours 100 lingots. Les prix sont en centimes d'euro, TVA comprise.
 */
export const INGOT_PACKS = [
  { id: "handful", label: "Poignée", ingots: 200, priceCents: 199 },
  { id: "bag", label: "Sac", ingots: 700, priceCents: 599 },
  { id: "chest", label: "Coffre", ingots: 1_500, priceCents: 1_199 },
  { id: "trunk", label: "Malle", ingots: 3_600, priceCents: 2_499 },
] as const;

export type IngotPack = (typeof INGOT_PACKS)[number];
export type IngotPackId = IngotPack["id"];

export const ingotPackIdSchema = z.enum(
  INGOT_PACKS.map(({ id }) => id) as [IngotPackId, ...IngotPackId[]],
);

export function getIngotPack(id: IngotPackId): IngotPack {
  const pack = INGOT_PACKS.find((candidate) => candidate.id === id);
  if (!pack) throw new Error(`Paquet de lingots inconnu : ${id}`);
  return pack;
}

/** Crédite les lingots d'un paquet payé. */
export function creditIngotPack(wallet: Wallet, id: IngotPackId): Wallet {
  return { ...wallet, ingots: wallet.ingots + getIngotPack(id).ingots };
}

/**
 * Lingots en plus d'un paquet, en pourcentage, par rapport au tarif du plus
 * petit paquet. Arrondi vers le bas : le bonus affiché n'est jamais exagéré.
 */
export function packBonusPercent(pack: IngotPack): number {
  const [base] = INGOT_PACKS;
  const atBaseRate = (pack.priceCents * base.ingots) / base.priceCents;
  return Math.max(0, Math.floor((pack.ingots / atBaseRate - 1) * 100));
}

/** Le paquet au meilleur bonus (« Meilleure offre »). */
export function bestPack(): IngotPack {
  return INGOT_PACKS.reduce((best, pack) =>
    packBonusPercent(pack) > packBonusPercent(best) ? pack : best,
  );
}
