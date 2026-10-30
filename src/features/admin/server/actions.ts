"use server";

import * as Sentry from "@sentry/nextjs";
import { refresh } from "next/cache";
import { z } from "zod";
import {
  adminData,
  PromotionTooCloseError,
  SeasonOverlapError,
} from "@/data/server";
import { NegativeBalanceError } from "@/domain";
import {
  adjustmentFormSchema,
  fieldErrors,
  giveawayFormSchema,
  promotionFormSchema,
  seasonFormSchema,
  type AdminFormState,
} from "../lib/schemas";
import { requireAdmin } from "./guard";

/** Toutes les actions vérifient elles-mêmes les droits : une page n'est pas une barrière. */

/** Attente maximale de l'envoi d'une erreur à Sentry, en millisecondes. */
const FLUSH_TIMEOUT_MS = 3000;

const playerIdSchema = z.uuid();

function formValues(formData: FormData): Record<string, string> {
  return Object.fromEntries(
    [...formData.entries()].filter(
      (entry): entry is [string, string] => typeof entry[1] === "string",
    ),
  );
}

export async function adjustPlayerAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const playerId = playerIdSchema.safeParse(formData.get("playerId"));
  if (!playerId.success) return { error: "Joueur inconnu." };

  const parsed = adjustmentFormSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  try {
    await adminData.adjustPlayer(playerId.data, parsed.data, admin.email);
  } catch (error) {
    if (error instanceof NegativeBalanceError)
      return { error: "Cette correction rendrait un solde négatif." };
    throw error;
  }
  refresh();
  return { success: "Correction enregistrée." };
}

export async function createGiveawayAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const parsed = giveawayFormSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };

  await adminData.createGiveaway(parsed.data, admin.email);
  refresh();
  return { success: "Cadeau programmé." };
}

export async function endGiveawayAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const giveawayId = z.uuid().safeParse(formData.get("giveawayId"));
  if (!giveawayId.success) return;
  await adminData.endGiveaway(giveawayId.data);
  refresh();
}

export async function resetUsernameAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const playerId = playerIdSchema.safeParse(formData.get("playerId"));
  if (!playerId.success) return;
  await adminData.resetUsername(playerId.data);
  refresh();
}

/**
 * Envoie une erreur de test à Sentry, pour vérifier le suivi des erreurs sur
 * la version déployée. Réservé à l'administration.
 */
export async function sendTestErrorAction(): Promise<AdminFormState> {
  await requireAdmin();
  // Sans DSN, Sentry est éteint : ne pas annoncer un envoi qui n'a pas lieu.
  if (!Sentry.getClient()?.getOptions().enabled)
    return { error: "Sentry est désactivé : aucun DSN configuré." };
  const eventId = Sentry.captureException(
    new Error("Erreur de test envoyée depuis l'administration"),
  );
  // Sur un hébergement sans serveur, l'envoi doit partir avant la réponse.
  const delivered = await Sentry.flush(FLUSH_TIMEOUT_MS);
  return delivered
    ? { success: `Erreur de test envoyée (${eventId}).` }
    : { error: "Sentry n'a pas répondu : DSN configuré ?" };
}

export async function createSeasonAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const parsed = seasonFormSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  try {
    await adminData.createSeason(parsed.data, admin.email);
  } catch (error) {
    if (error instanceof SeasonOverlapError)
      return { error: "Une saison est déjà programmée sur ces dates." };
    throw error;
  }
  refresh();
  return { success: "Saison programmée." };
}

export async function createPromotionAction(
  _previous: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const admin = await requireAdmin();
  const parsed = promotionFormSchema.safeParse(formValues(formData));
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  try {
    await adminData.createPromotion(parsed.data, admin.email);
  } catch (error) {
    if (error instanceof PromotionTooCloseError)
      return {
        error:
          "Il faut 30 jours sans promotion avant et après chacune, et une fin dans le futur.",
      };
    throw error;
  }
  refresh();
  return { success: "Promotion programmée." };
}

export async function endPromotionAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const promotionId = z.uuid().safeParse(formData.get("promotionId"));
  if (!promotionId.success) return;
  await adminData.endPromotion(promotionId.data);
  refresh();
}

export async function endSeasonAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const seasonId = z.uuid().safeParse(formData.get("seasonId"));
  if (!seasonId.success) return;
  await adminData.endSeason(seasonId.data);
  refresh();
}

/** Offre 30 jours de pass VIP à un joueur (tests entre amis, geste commercial). */
export async function grantVipAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const playerId = playerIdSchema.safeParse(formData.get("playerId"));
  if (!playerId.success) return;
  await adminData.grantVip(playerId.data, admin.email);
  refresh();
}

/** Donne la voie payante de la saison en cours à un joueur (tests entre amis). */
export async function grantSeasonPassAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const playerId = playerIdSchema.safeParse(formData.get("playerId"));
  const seasonId = z.uuid().safeParse(formData.get("seasonId"));
  if (!playerId.success || !seasonId.success) return;
  await adminData.grantSeasonPass(playerId.data, seasonId.data, admin.email);
  refresh();
}
