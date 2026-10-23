"use server";

import { refresh } from "next/cache";
import { z } from "zod";
import { adminData } from "@/data/server";
import { NegativeBalanceError } from "@/domain";
import {
  adjustmentFormSchema,
  fieldErrors,
  giveawayFormSchema,
  type AdminFormState,
} from "../lib/schemas";
import { requireAdmin } from "./guard";

/** Toutes les actions vérifient elles-mêmes les droits : une page n'est pas une barrière. */

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
