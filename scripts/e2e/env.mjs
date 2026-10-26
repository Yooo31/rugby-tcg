// Variables d'environnement de l'application pendant les tests de bout en
// bout : elle parle à la pile Supabase locale (`supabase start`), jamais au
// vrai projet. Les clés viennent de `supabase status` : ce sont les clés de
// démonstration publiques du CLI, identiques sur toutes les machines.
import { execFileSync } from "node:child_process";

/** Port de l'application testée (3000 est souvent déjà pris). */
export const E2E_PORT = 3200;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;
/** Seule adresse administratrice des tests. */
export const E2E_ADMIN_EMAIL = "admin@rugby-tcg.test";

function supabaseStatus() {
  const output = execFileSync(
    "pnpm",
    ["exec", "supabase", "status", "--output", "json"],
    { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
  );
  const status = JSON.parse(output.slice(output.indexOf("{")));
  return {
    apiUrl: status.API_URL,
    dbUrl: status.DB_URL,
    publishableKey: status.PUBLISHABLE_KEY,
  };
}

export function e2eEnv() {
  const { apiUrl, dbUrl, publishableKey } = supabaseStatus();
  return {
    NEXT_PUBLIC_SUPABASE_URL: apiUrl,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishableKey,
    NEXT_PUBLIC_SITE_URL: E2E_BASE_URL,
    DATABASE_URL: dbUrl,
    DIRECT_URL: dbUrl,
    ADMIN_EMAILS: E2E_ADMIN_EMAIL,
    // Pas de notifications pendant les tests.
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: "",
    VAPID_PRIVATE_KEY: "",
    NEXT_TELEMETRY_DISABLED: "1",
  };
}
