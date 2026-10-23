// Prépare la base locale des tests de bout en bout : schéma Prisma et
// catalogue des clubs. À lancer après `supabase start` (pnpm e2e:prepare).
import { execFileSync } from "node:child_process";
import { e2eEnv } from "./env.mjs";

const env = { ...process.env, ...e2eEnv() };
const run = (...args) => execFileSync("pnpm", args, { stdio: "inherit", env });

run("exec", "prisma", "migrate", "deploy");
run("db:seed");
