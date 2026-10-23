"use server";

import { z } from "zod";
import { notificationData } from "@/data/server";
import { requireAuthUser } from "@/features/auth/server";
import { pushSubscriptionSchema } from "../lib/schemas";

/** Abonne l'appareil du joueur connecté ; `false` si l'abonnement est invalide. */
export async function subscribePush(subscription: unknown): Promise<boolean> {
  const user = await requireAuthUser();
  const parsed = pushSubscriptionSchema.safeParse(subscription);
  if (!parsed.success) return false;
  await notificationData.subscribe(user.id, {
    endpoint: parsed.data.endpoint,
    p256dh: parsed.data.keys.p256dh,
    auth: parsed.data.keys.auth,
  });
  return true;
}

export async function unsubscribePush(endpoint: unknown): Promise<void> {
  const user = await requireAuthUser();
  const parsed = z.url().safeParse(endpoint);
  if (parsed.success) await notificationData.unsubscribe(user.id, parsed.data);
}
