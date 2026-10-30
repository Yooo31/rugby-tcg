import type Stripe from "stripe";
import { z } from "zod";
import {
  productLabel,
  productPriceCents,
  purchaseProductSchema,
  type PurchaseProduct,
} from "@/domain";

/** Seule devise vendue : la vente commence en France. */
const CURRENCY = "eur";

/** Page où revient le joueur après un paiement (réussi ou abandonné). */
const PAYMENT_THANKS_PATH = "/paiement/merci";

/** Ce que l'on attache au paiement pour le créditer au retour (webhook). */
const metadataSchema = z.object({
  playerId: z.uuid(),
  kind: z.string(),
  productId: z.string(),
  /** Prix fixé par le serveur à l'ouverture (promotion comprise). */
  priceCents: z.coerce.number().int().min(1),
});

/**
 * Paramètres de la page de paiement Stripe pour ce joueur et ce produit. Le
 * montant vient du domaine, jamais du navigateur ; le joueur est celui de la
 * session vérifiée.
 */
export function checkoutSessionParams({
  playerId,
  email,
  product,
  priceCents,
  siteUrl,
}: {
  readonly playerId: string;
  readonly email: string | null;
  readonly product: PurchaseProduct;
  /** Prix à payer, calculé par le serveur (promotion comprise). */
  readonly priceCents: number;
  readonly siteUrl: string;
}): Stripe.Checkout.SessionCreateParams {
  const metadata = {
    playerId,
    kind: product.kind,
    productId: product.id,
    priceCents: String(priceCents),
  };
  return {
    mode: "payment",
    locale: "fr",
    client_reference_id: playerId,
    ...(email ? { customer_email: email } : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: CURRENCY,
          unit_amount: priceCents,
          product_data: { name: productLabel(product) },
        },
      },
    ],
    metadata,
    // Repris sur le paiement : un remboursement le retrouve.
    payment_intent_data: { metadata },
    success_url: `${siteUrl}${PAYMENT_THANKS_PATH}`,
    cancel_url: `${siteUrl}/boutique`,
  };
}

/** Paiement reçu, prêt à créditer. */
export interface PaidPurchase {
  readonly playerId: string;
  readonly product: PurchaseProduct;
  /** Identifiant de la session Stripe : un paiement, un crédit. */
  readonly reference: string;
  /** Prix payé (promotion comprise). */
  readonly priceCents: number;
}

/** Ce qui fait refuser un paiement annoncé par Stripe. */
export type PurchaseRejection =
  | "unpaid"
  | "wrong-mode"
  | "wrong-currency"
  | "unknown-product"
  | "wrong-player"
  | "wrong-amount";

/**
 * Vérifie une session de paiement terminée avant tout crédit : payée, dans
 * le bon mode (test ou production), en euros, pour un produit connu, au bon
 * montant, et pour le joueur qui l'a ouverte.
 */
export function paidPurchase(
  session: Pick<
    Stripe.Checkout.Session,
    | "id"
    | "client_reference_id"
    | "metadata"
    | "amount_total"
    | "currency"
    | "payment_status"
    | "livemode"
  >,
  isLiveMode: boolean,
): PaidPurchase | { readonly rejected: PurchaseRejection } {
  if (session.payment_status !== "paid") return { rejected: "unpaid" };
  if (session.livemode !== isLiveMode) return { rejected: "wrong-mode" };
  if (session.currency !== CURRENCY) return { rejected: "wrong-currency" };
  const metadata = metadataSchema.safeParse(session.metadata);
  const product = metadata.success
    ? purchaseProductSchema.safeParse({
        kind: metadata.data.kind,
        id: metadata.data.productId,
      })
    : null;
  if (!metadata.success || !product?.success)
    return { rejected: "unknown-product" };
  if (session.client_reference_id !== metadata.data.playerId)
    return { rejected: "wrong-player" };
  // Le prix fixé par le serveur ne dépasse jamais le prix normal (une
  // promotion ne fait que baisser), et c'est bien ce qui a été payé.
  const { priceCents } = metadata.data;
  if (
    priceCents > productPriceCents(product.data) ||
    session.amount_total !== priceCents
  )
    return { rejected: "wrong-amount" };
  return {
    playerId: metadata.data.playerId,
    product: product.data,
    reference: session.id,
    priceCents,
  };
}
