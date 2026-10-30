import "server-only";
import Stripe from "stripe";
import { paymentData } from "@/data/server";
import { isLiveKey, type WebhookDependencies } from "./webhook";

/**
 * Client Stripe, ou `null` tant que `STRIPE_SECRET_KEY` n'est pas défini
 * (en local et en CI) : les boutons de paiement disent alors « indisponible ».
 */
export function stripeClient(): Stripe | null {
  const key = process.env["STRIPE_SECRET_KEY"];
  return key ? new Stripe(key) : null;
}

/** Le mode des paiements attendus : production avec une clé `sk_live_`. */
export function isLiveMode(): boolean {
  return isLiveKey(process.env["STRIPE_SECRET_KEY"] ?? "");
}

/** Dépendances réelles du webhook, ou `null` si Stripe n'est pas configuré. */
export function webhookDependencies(): WebhookDependencies | null {
  const stripe = stripeClient();
  const secret = process.env["STRIPE_WEBHOOK_SECRET"];
  if (!stripe || !secret) return null;
  return {
    stripe,
    secret,
    credit: paymentData.credit,
    revoke: paymentData.revoke,
    sessionOfPayment: async (paymentIntent) => {
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: paymentIntent,
        limit: 1,
      });
      return sessions.data[0]?.id ?? null;
    },
  };
}
