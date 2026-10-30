"use server";

import {
  createServerPlayerRepository,
  createServerRateLimiter,
} from "@/data/server";
import { productPrice, purchaseProductSchema } from "@/domain";
import { requireAuthUser } from "@/features/auth/server";
import { checkoutSessionParams } from "../lib/checkout";
import { stripeClient } from "./config";

/** Ouvertures de paiement par joueur et par minute : garde-fou contre les abus. */
const CHECKOUTS_PER_MINUTE = 5;
const MINUTE_MS = 60_000;

const limiter = createServerRateLimiter({
  limit: CHECKOUTS_PER_MINUTE,
  windowMs: MINUTE_MS,
});

/** Réponse au navigateur : l'adresse de la page de paiement, ou un refus. */
export type CheckoutResult =
  | { readonly ok: true; readonly url: string }
  | {
      readonly ok: false;
      readonly error:
        | "unavailable"
        | "invalid"
        | "waiver-required"
        | "already-owned"
        | "rate-limited";
    };

/**
 * Ouvre une page de paiement Stripe pour le joueur connecté. Le navigateur
 * n'envoie que le produit voulu et sa renonciation au délai de rétractation ;
 * le joueur et le montant viennent du serveur.
 */
export async function startCheckout(
  product: unknown,
  waivesWithdrawal: unknown,
): Promise<CheckoutResult> {
  const user = await requireAuthUser();
  const parsed = purchaseProductSchema.safeParse(product);
  if (!parsed.success) return { ok: false, error: "invalid" };
  // Contenu numérique fourni tout de suite (CGV, art. L221-28) : renonciation explicite.
  if (waivesWithdrawal !== true) return { ok: false, error: "waiver-required" };
  const stripe = stripeClient();
  const siteUrl = process.env["NEXT_PUBLIC_SITE_URL"];
  if (!stripe || !siteUrl) return { ok: false, error: "unavailable" };
  if (!(await limiter.take(`checkout:${user.id}`)))
    return { ok: false, error: "rate-limited" };

  // Saison et promotion en cours, lues côté serveur.
  const { season, promotion, welcomeOffer } =
    await createServerPlayerRepository(user.id).get();
  // L'offre de bienvenue ne se vend qu'une fois.
  if (parsed.data.kind === "welcome" && !welcomeOffer)
    return { ok: false, error: "already-owned" };
  if (parsed.data.kind === "season-pass") {
    // Seule la saison en cours se vend, et une seule fois.
    if (!season || season.season.id !== parsed.data.id)
      return { ok: false, error: "invalid" };
    if (season.hasPremium) return { ok: false, error: "already-owned" };
  }

  const session = await stripe.checkout.sessions.create(
    checkoutSessionParams({
      playerId: user.id,
      email: user.email ?? null,
      product: parsed.data,
      priceCents: productPrice(parsed.data, promotion).priceCents,
      siteUrl,
    }),
  );
  if (!session.url) return { ok: false, error: "unavailable" };
  return { ok: true, url: session.url };
}
