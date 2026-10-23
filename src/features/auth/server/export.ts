import "server-only";
import { accountData } from "@/data/server";
import { toDayKey } from "@/lib/dates";
import { getAuthUser } from "./session";

/** Les identifiants techniques en `bigint` ne passent pas tels quels en JSON. */
function toJson(value: unknown): string {
  return JSON.stringify(
    value,
    (_key, item: unknown) => (typeof item === "bigint" ? String(item) : item),
    2,
  );
}

/** Fichier JSON de toutes les données du joueur connecté (droit à la portabilité). */
export async function accountExportResponse(): Promise<Response> {
  const user = await getAuthUser();
  if (!user) return new Response("Connexion requise.", { status: 401 });
  const data = await accountData.export(user.id);
  return new Response(toJson(data), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="rugby-tcg-mes-donnees-${toDayKey(new Date())}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
