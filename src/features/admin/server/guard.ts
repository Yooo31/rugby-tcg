import "server-only";
import { notFound } from "next/navigation";
import { getAuthUser } from "@/features/auth/server";
import { isAdminEmail, parseAdminEmails } from "../lib/admins";

export interface Admin {
  readonly email: string;
}

/**
 * Administrateur connecté, ou page introuvable : on ne révèle pas qu'une
 * administration existe. À appeler dans CHAQUE page et action d'admin.
 */
export async function requireAdmin(): Promise<Admin> {
  const user = await getAuthUser();
  const admins = parseAdminEmails(process.env["ADMIN_EMAILS"]);
  if (!user?.email || !isAdminEmail(user.email, admins)) notFound();
  return { email: user.email.toLowerCase() };
}

/** Le joueur connecté est-il administrateur ? (pour afficher un lien, jamais pour autoriser) */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const user = await getAuthUser();
  return isAdminEmail(
    user?.email ?? null,
    parseAdminEmails(process.env["ADMIN_EMAILS"]),
  );
}
