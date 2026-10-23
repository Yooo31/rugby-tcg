import "server-only";
import webpush, { WebPushError } from "web-push";
import type { PushSender } from "./notifications";

/** Codes HTTP par lesquels un service de notification signale un abonnement mort. */
const GONE_STATUSES = new Set([404, 410]);
/** Durée de vie d'une notification non délivrée (appareil éteint), en secondes. */
const TIME_TO_LIVE_S = 6 * 60 * 60;

/** Expéditeur Web Push, ou `null` si les clés ne sont pas configurées. */
export function createWebPushSender(): PushSender | null {
  const publicKey = process.env["NEXT_PUBLIC_VAPID_PUBLIC_KEY"];
  const privateKey = process.env["VAPID_PRIVATE_KEY"];
  const subject = process.env["VAPID_SUBJECT"];
  if (!publicKey || !privateKey || !subject) return null;
  webpush.setVapidDetails(subject, publicKey, privateKey);

  return async (target, message) => {
    try {
      await webpush.sendNotification(
        {
          endpoint: target.endpoint,
          keys: { p256dh: target.p256dh, auth: target.auth },
        },
        JSON.stringify(message),
        { TTL: TIME_TO_LIVE_S },
      );
      return "sent";
    } catch (error) {
      if (error instanceof WebPushError && GONE_STATUSES.has(error.statusCode))
        return "gone";
      console.error("Notification non délivrée", error);
      return "failed";
    }
  };
}
