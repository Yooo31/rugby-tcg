import { z } from "zod";
import { getIngotPack, INGOT_PACKS, type IngotPackId } from "./shop";
import { discountedCents, type Promotion } from "./promotion";
import { SEASON_PASS_PRICE_CENTS } from "./season";
import { getVipOffer, VIP_OFFERS, type VipOffer } from "./vip";
import { WELCOME_OFFER } from "./welcome";

/**
 * Ce qui se paie en euros (Stripe) : un paquet de lingots, une période de
 * pass VIP, ou la voie payante de la saison en cours. Chaque achat est
 * ponctuel : rien ne se renouvelle tout seul (voir les CGV).
 */
export const purchaseProductSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("ingots"),
    id: z.enum(
      INGOT_PACKS.map(({ id }) => id) as [IngotPackId, ...IngotPackId[]],
    ),
  }),
  z.object({
    kind: z.literal("vip"),
    id: z.enum(
      VIP_OFFERS.map(({ id }) => id) as [VipOffer["id"], ...VipOffer["id"][]],
    ),
  }),
  /** La voie payante de la saison `id`. */
  z.object({ kind: z.literal("season-pass"), id: z.uuid() }),
  /** L'offre de bienvenue, une seule fois par compte. */
  z.object({ kind: z.literal("welcome"), id: z.literal(WELCOME_OFFER.id) }),
]);

export type PurchaseProduct = z.infer<typeof purchaseProductSchema>;

/** Prix d'un produit, en centimes d'euro TTC. */
export function productPriceCents(product: PurchaseProduct): number {
  switch (product.kind) {
    case "ingots":
      return getIngotPack(product.id).priceCents;
    case "vip":
      return getVipOffer(product.id).priceCents;
    case "season-pass":
      return SEASON_PASS_PRICE_CENTS;
    case "welcome":
      return WELCOME_OFFER.priceCents;
  }
}

/** Libellé d'un produit, tel qu'il apparaît sur la page de paiement et le reçu. */
export function productLabel(product: PurchaseProduct): string {
  switch (product.kind) {
    case "ingots":
      return `${getIngotPack(product.id).ingots} lingots`;
    case "vip":
      return `Pass VIP, ${getVipOffer(product.id).label.toLowerCase()}`;
    case "season-pass":
      return "Passe de saison, voie payante";
    case "welcome":
      return `${WELCOME_OFFER.label} : ${WELCOME_OFFER.ingots} lingots et ${WELCOME_OFFER.vipDays} jours de VIP`;
  }
}

/** Prix à payer pendant une éventuelle promotion, et prix normal à barrer. */
export interface ProductPrice {
  readonly priceCents: number;
  /** Prix normal ; différent de `priceCents` seulement pendant une promotion. */
  readonly regularCents: number;
}

export function productPrice(
  product: PurchaseProduct,
  promotion: Pick<Promotion, "percentOff"> | null,
): ProductPrice {
  const regularCents = productPriceCents(product);
  // L'offre de bienvenue a déjà son petit prix : pas de promotion en plus.
  const applies = promotion !== null && product.kind !== "welcome";
  return {
    priceCents: applies
      ? discountedCents(regularCents, promotion.percentOff)
      : regularCents,
    regularCents,
  };
}
