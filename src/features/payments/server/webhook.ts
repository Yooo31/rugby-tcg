import "server-only";
import type Stripe from "stripe";
import type { PurchaseProduct } from "@/domain";
import { paidPurchase } from "../lib/checkout";

/** Ce dont le webhook a besoin : injecté pour les tests. */
export interface WebhookDependencies {
  readonly stripe: Stripe;
  readonly secret: string;
  readonly credit: (
    playerId: string,
    product: PurchaseProduct,
    reference: string,
    priceCents: number,
  ) => Promise<boolean>;
  readonly revoke: (reference: string) => Promise<unknown>;
  /** Session de paiement d'un paiement Stripe (pour retrouver un remboursement). */
  readonly sessionOfPayment: (
    paymentIntentId: string,
  ) => Promise<string | null>;
}

/** Une clé de production commence par `sk_live_` : le webhook vérifie le mode. */
export function isLiveKey(secretKey: string): boolean {
  return secretKey.startsWith("sk_live_");
}

function paymentIntentId(
  value: string | Stripe.PaymentIntent | null,
): string | null {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

/**
 * Traite un événement Stripe vérifié. Renvoie ce qui a été fait, pour le
 * journal. Une erreur levée fait répondre 500 : Stripe renverra l'événement.
 */
async function handleEvent(
  event: Stripe.Event,
  deps: WebhookDependencies,
  isLiveMode: boolean,
): Promise<string> {
  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const purchase = paidPurchase(event.data.object, isLiveMode);
      if ("rejected" in purchase) {
        // Un paiement différé (virement) arrive plus tard : rien d'anormal.
        if (purchase.rejected !== "unpaid")
          console.error(
            `Paiement Stripe refusé (${purchase.rejected}) : ${event.data.object.id}`,
          );
        return `ignoré : ${purchase.rejected}`;
      }
      const credited = await deps.credit(
        purchase.playerId,
        purchase.product,
        purchase.reference,
        purchase.priceCents,
      );
      return credited ? "crédité" : "déjà crédité";
    }
    case "charge.refunded": {
      // Un remboursement partiel ne retire rien : il se règle à la main.
      if (!event.data.object.refunded) return "ignoré : remboursement partiel";
      return revokePayment(
        paymentIntentId(event.data.object.payment_intent),
        deps,
      );
    }
    case "charge.dispute.created":
      return revokePayment(
        paymentIntentId(event.data.object.payment_intent),
        deps,
      );
    default:
      return "ignoré";
  }
}

async function revokePayment(
  paymentIntent: string | null,
  deps: WebhookDependencies,
): Promise<string> {
  const reference = paymentIntent
    ? await deps.sessionOfPayment(paymentIntent)
    : null;
  if (!reference) return "ignoré : paiement inconnu";
  await deps.revoke(reference);
  return "retiré";
}

/**
 * Point d'entrée du webhook : seule source de vérité d'un achat. La signature
 * est vérifiée sur le corps brut, avant toute lecture.
 */
export async function stripeWebhookResponse(
  request: Request,
  deps: WebhookDependencies,
  isLiveMode: boolean,
): Promise<Response> {
  const signature = request.headers.get("stripe-signature");
  if (!signature) return new Response("Signature absente.", { status: 400 });
  let event: Stripe.Event;
  try {
    event = deps.stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      deps.secret,
    );
  } catch {
    return new Response("Signature invalide.", { status: 400 });
  }
  const outcome = await handleEvent(event, deps, isLiveMode);
  return Response.json({ received: true, outcome });
}
