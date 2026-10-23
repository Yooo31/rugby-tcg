import { z } from "zod";

/** Abonnement envoyé par le navigateur (`PushSubscription.toJSON()`), vérifié avant d'être gardé. */
export const pushSubscriptionSchema = z.object({
  endpoint: z.url({ protocol: /^https$/ }).max(1000),
  keys: z.object({
    p256dh: z.string().min(1).max(200),
    auth: z.string().min(1).max(100),
  }),
});
