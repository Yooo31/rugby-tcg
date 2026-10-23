import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";
import {
  HOME_PATH,
  isGuestOnlyPath,
  isPublicPath,
  SIGN_IN_PATH,
} from "./routes";

/**
 * Rafraîchit la session du joueur et aiguille la requête :
 * sans session, tout mène à la connexion ; avec, les pages d'authentification
 * renvoient au jeu.
 *
 * Ce contrôle évite d'afficher le jeu à un visiteur, mais il ne protège aucune
 * donnée : chaque action serveur revérifie l'identité du joueur.
 */
export async function updateSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        // Le jeton rafraîchi doit atteindre à la fois le rendu serveur (requête)
        // et le navigateur (réponse).
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  // Ne rien intercaler entre la création du client et cet appel : c'est lui
  // qui vérifie le jeton et le renouvelle s'il a expiré.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  if (!isSignedIn && !isPublicPath(pathname)) {
    return redirect(request, response, SIGN_IN_PATH, pathname);
  }
  if (isSignedIn && isGuestOnlyPath(pathname)) {
    return redirect(request, response, HOME_PATH);
  }
  return response;
}

/** Redirige en conservant les cookies de session posés pendant la requête. */
function redirect(
  request: NextRequest,
  sessionResponse: NextResponse,
  pathname: string,
  returnTo?: string,
): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  if (returnTo && returnTo !== HOME_PATH)
    url.searchParams.set("next", returnTo);

  const redirection = NextResponse.redirect(url);
  for (const cookie of sessionResponse.cookies.getAll())
    redirection.cookies.set(cookie);
  return redirection;
}
