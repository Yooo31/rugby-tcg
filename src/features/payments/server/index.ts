import "server-only";
import { isLiveMode, webhookDependencies } from "./config";
import { stripeWebhookResponse } from "./webhook";

/** Webhook Stripe ; 503 tant que Stripe n'est pas configuré. */
export async function stripeWebhook(request: Request): Promise<Response> {
  const deps = webhookDependencies();
  if (!deps)
    return Response.json(
      {
        error:
          "Paiement non configuré (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).",
      },
      { status: 503 },
    );
  return stripeWebhookResponse(request, deps, isLiveMode());
}
