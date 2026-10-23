import "server-only";
import { redirect } from "next/navigation";
import { ensurePlayer as ensurePlayerRow } from "@/data/server";
import { SIGN_IN_PATH } from "@/lib/supabase/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthUser {
  readonly id: string;
  readonly email: string | null;
}

/**
 * Joueur connecté, d'après un jeton vérifié (signature et expiration), ou `null`.
 * C'est la seule source d'identité à utiliser côté serveur : ne jamais se fier
 * à un identifiant envoyé par le navigateur.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims?.sub) return null;
  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
  };
}

/** Joueur connecté, ou redirection vers la connexion. */
export async function requireAuthUser(): Promise<AuthUser> {
  return (await getAuthUser()) ?? redirect(SIGN_IN_PATH);
}

const metadataText = (
  metadata: Readonly<Record<string, unknown>> | undefined,
  key: string,
): string | null => {
  const value = metadata?.[key];
  return typeof value === "string" ? value : null;
};

/**
 * Crée la ligne du joueur à sa première venue, avec le pseudo et le code de
 * parrainage saisis à l'inscription. Ils attendent dans les métadonnées du
 * compte jusque-là (l'e-mail doit parfois être confirmé avant).
 */
export async function ensurePlayer(user: {
  readonly id: string;
  readonly user_metadata?: Readonly<Record<string, unknown>>;
}): Promise<void> {
  await ensurePlayerRow(user.id, {
    username: metadataText(user.user_metadata, "username"),
    referralCode: metadataText(user.user_metadata, "referralCode"),
  });
}
