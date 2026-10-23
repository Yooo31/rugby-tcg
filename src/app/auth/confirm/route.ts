import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { ensurePlayer } from "@/features/auth/server";
import { safeNextPath, SIGN_IN_PATH } from "@/lib/supabase/routes";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Retour des liens reçus par e-mail (confirmation d'inscription, mot de passe
 * oublié). Échange le jeton du lien contre une session, puis envoie le joueur
 * vers la page prévue. Deux formats existent selon le modèle d'e-mail :
 * `code` (lien par défaut de Supabase) et `token_hash` (modèle personnalisé).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createSupabaseServerClient();
  const { data, error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
      : { data: null, error: new Error("Lien incomplet") };

  const destination = request.nextUrl.clone();
  destination.search = "";

  if (error || !data?.user) {
    destination.pathname = SIGN_IN_PATH;
    destination.searchParams.set("lien", "invalide");
    return NextResponse.redirect(destination);
  }

  await ensurePlayer(data.user);
  destination.pathname = safeNextPath(searchParams.get("next"));
  return NextResponse.redirect(destination);
}
