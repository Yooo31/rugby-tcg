import { stripeWebhook } from "@/features/payments/server";

/** Appelée par Stripe à chaque paiement : voir CLAUDE.md (Paiements). */
export function POST(request: Request) {
  return stripeWebhook(request);
}
