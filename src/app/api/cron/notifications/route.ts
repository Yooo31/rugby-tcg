import { notificationsCronResponse } from "@/features/notifications/server";

/** Appelée par la tâche planifiée : voir CLAUDE.md (Notifications). */
export function GET(request: Request) {
  return notificationsCronResponse(request);
}
