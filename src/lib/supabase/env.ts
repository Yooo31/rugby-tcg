/** Variables publiques de Supabase. Une erreur claire vaut mieux qu'un client mal configuré. */
function required(name: string, value: string | undefined): string {
  if (!value)
    throw new Error(
      `${name} est absent de l'environnement (voir .env.example).`,
    );
  return value;
}

// Next.js n'expose au navigateur que les accès écrits en toutes lettres : pas de lecture dynamique.
export const SUPABASE_URL = required(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);
export const SUPABASE_PUBLISHABLE_KEY = required(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
