import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from "./env";

/**
 * Client Supabase côté serveur, lié aux cookies de la requête en cours.
 * À créer à chaque requête : il ne doit jamais être partagé entre deux joueurs.
 */
export async function createSupabaseServerClient() {
  // Le client lit l'heure (expiration de la session) : avec Cache Components,
  // cela n'est permis qu'au moment de la requête, jamais pendant un pré-rendu.
  await connection();
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Appelé depuis un Server Component, qui ne peut pas écrire de cookie.
          // Sans conséquence : le proxy rafraîchit la session à chaque requête.
        }
      },
    },
  });
}
