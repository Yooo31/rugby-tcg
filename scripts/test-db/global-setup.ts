// Base Postgres jetable pour les tests d'intégration (`pnpm test:db`).
// Lance un conteneur Docker s'il n'existe pas, recrée un schéma vierge,
// simule ce que Supabase fournit (schéma `auth`, rôles `anon` et `authenticated`)
// puis applique les vraies migrations du projet.
import { execFileSync } from "node:child_process";
import { setTimeout as sleep } from "node:timers/promises";

const CONTAINER = "rugby-tcg-test-db";
/** Port local du conteneur : différent de 5432, souvent déjà pris. */
const PORT = 54329;
/** Même version majeure que Postgres chez Supabase. */
const IMAGE = "postgres:15";
export const TEST_DATABASE_URL = `postgresql://postgres:postgres@localhost:${PORT}/postgres`;
const READY_ATTEMPTS = 60;
const READY_DELAY_MS = 500;

function docker(...args: string[]): string {
  return execFileSync("docker", args, { encoding: "utf8" }).trim();
}

function ensureContainer(): void {
  const running = docker("ps", "-q", "--filter", `name=^${CONTAINER}$`);
  if (running) return;
  const existing = docker("ps", "-aq", "--filter", `name=^${CONTAINER}$`);
  if (existing) {
    docker("start", CONTAINER);
    return;
  }
  docker(
    "run",
    "-d",
    "--name",
    CONTAINER,
    "-e",
    "POSTGRES_PASSWORD=postgres",
    "-p",
    `${PORT}:5432`,
    IMAGE,
  );
}

async function waitForDatabase(): Promise<void> {
  for (let attempt = 0; attempt < READY_ATTEMPTS; attempt += 1) {
    try {
      // Par TCP : pendant l'initialisation, un serveur temporaire n'écoute que
      // sur le socket local, puis redémarre.
      docker(
        "exec",
        CONTAINER,
        "psql",
        "-h",
        "127.0.0.1",
        "-U",
        "postgres",
        "-tAc",
        "SELECT 1",
      );
      return;
    } catch {
      await sleep(READY_DELAY_MS);
    }
  }
  throw new Error(`La base de test (${CONTAINER}) ne répond pas.`);
}

function psql(sql: string): void {
  execFileSync(
    "docker",
    [
      "exec",
      "-i",
      CONTAINER,
      "psql",
      "-h",
      "127.0.0.1",
      "-U",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-q",
    ],
    { input: sql, stdio: ["pipe", "ignore", "inherit"] },
  );
}

/** Ce que Supabase fournit d'office et dont les migrations dépendent. */
const SUPABASE_PRELUDE = `
  DROP SCHEMA IF EXISTS public CASCADE;
  DROP SCHEMA IF EXISTS auth CASCADE;
  CREATE SCHEMA public;
  CREATE SCHEMA auth;
  CREATE TABLE auth.users (
    id uuid PRIMARY KEY,
    email text,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  DO $$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'anon') THEN CREATE ROLE anon; END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'authenticated') THEN CREATE ROLE authenticated; END IF;
  END $$;
`;

export default async function setup(): Promise<void> {
  ensureContainer();
  await waitForDatabase();
  psql(SUPABASE_PRELUDE);

  execFileSync("pnpm", ["exec", "prisma", "migrate", "deploy"], {
    stdio: "inherit",
    env: { ...process.env, DIRECT_URL: TEST_DATABASE_URL },
  });
  process.env["TEST_DATABASE_URL"] = TEST_DATABASE_URL;
}
