import { z } from "zod";

/**
 * Promotions : une baisse de prix réelle et limitée dans le temps, sur tous
 * les achats en euros (lingots, pass VIP, voie payante de saison).
 *
 * Code de la consommation (art. L112-1-1) : le prix barré d'une réduction
 * doit être le plus bas pratiqué dans les 30 jours qui la précèdent. Deux
 * promotions sont donc séparées d'au moins 30 jours : le prix barré est
 * toujours le prix normal. Jamais de fausse réduction.
 */

/** Jours sans promotion avant (et après) chaque promotion. */
export const PROMOTION_GAP_DAYS = 30;
/** Réduction au plus : garde-fou contre une faute de frappe. */
export const MAX_PROMOTION_PERCENT = 50;

const DAY_MS = 24 * 60 * 60 * 1000;

export const promotionSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(80),
  percentOff: z.number().int().min(1).max(MAX_PROMOTION_PERCENT),
  /** Début inclus, fin exclue (ms Unix). */
  startsAt: z.number(),
  endsAt: z.number(),
});

export type Promotion = z.infer<typeof promotionSchema>;

/** La promotion en cours, s'il y en a une. */
export function activePromotion(
  promotions: readonly Promotion[],
  now: number,
): Promotion | null {
  return (
    promotions.find(
      ({ startsAt, endsAt }) => startsAt <= now && now < endsAt,
    ) ?? null
  );
}

/** Prix réduit, au centime près ; jamais moins d'un centime. */
export function discountedCents(
  priceCents: number,
  percentOff: number,
): number {
  return Math.max(1, Math.round((priceCents * (100 - percentOff)) / 100));
}

/**
 * Peut-on programmer cette période ? Elle doit commencer dans le futur et
 * rester à 30 jours au moins de toute autre promotion, avant comme après.
 */
export function canSchedulePromotion(
  existing: readonly Pick<Promotion, "startsAt" | "endsAt">[],
  period: Pick<Promotion, "startsAt" | "endsAt">,
  now: number,
): boolean {
  if (period.endsAt <= period.startsAt || period.endsAt <= now) return false;
  const gap = PROMOTION_GAP_DAYS * DAY_MS;
  return existing.every(
    (other) =>
      period.startsAt >= other.endsAt + gap ||
      period.endsAt + gap <= other.startsAt,
  );
}
