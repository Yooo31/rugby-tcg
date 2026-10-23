import { z } from "zod";
import type { Wallet } from "./wallet";

/** Plus grande correction admise en une fois : garde-fou contre une faute de frappe. */
export const MAX_ADJUSTMENT = 100_000;

/**
 * Correction manuelle d'un joueur par l'administration (geste commercial,
 * réparation d'un bug). Toujours motivée, jamais nulle.
 */
export const adjustmentSchema = z
  .object({
    ingotsDelta: z.number().int().min(-MAX_ADJUSTMENT).max(MAX_ADJUSTMENT),
    boostersDelta: z.number().int().min(-MAX_ADJUSTMENT).max(MAX_ADJUSTMENT),
    reason: z.string().trim().min(3, "Indiquez la raison.").max(200),
  })
  .refine(
    ({ ingotsDelta, boostersDelta }) =>
      ingotsDelta !== 0 || boostersDelta !== 0,
    "La correction ne change rien.",
  );

export type Adjustment = z.infer<typeof adjustmentSchema>;

/** Applique une correction ; refuse de rendre un solde négatif. */
export function applyAdjustment(
  wallet: Wallet,
  adjustment: Adjustment,
): Wallet {
  const next = {
    ingots: wallet.ingots + adjustment.ingotsDelta,
    bonusBoosters: wallet.bonusBoosters + adjustment.boostersDelta,
  };
  if (next.ingots < 0 || next.bonusBoosters < 0)
    throw new NegativeBalanceError();
  return next;
}

export class NegativeBalanceError extends Error {
  constructor() {
    super("La correction rendrait un solde négatif.");
    this.name = "NegativeBalanceError";
  }
}
