import { accountExportResponse } from "@/features/auth/server";

/** Téléchargement de toutes les données du joueur (RGPD). */
export function GET() {
  return accountExportResponse();
}
