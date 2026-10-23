import "server-only";
import { notificationData } from "@/data/server";
import { isCronAuthorized } from "../lib/cron-auth";

/**
 * Tâche planifiée (toutes les 15 minutes) : envoie les notifications dues.
 * Protégée par `CRON_SECRET` (en-tête `Authorization: Bearer …`).
 */
export async function notificationsCronResponse(
  request: Request,
): Promise<Response> {
  if (
    !isCronAuthorized(
      request.headers.get("authorization"),
      process.env["CRON_SECRET"],
    )
  )
    return new Response("Non autorisé.", { status: 401 });

  const run = await notificationData.sendDue();
  if (!run)
    return Response.json(
      { error: "Clés de notification (VAPID) absentes." },
      { status: 503 },
    );
  return Response.json(run);
}
