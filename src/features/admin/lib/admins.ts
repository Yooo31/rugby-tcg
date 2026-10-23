/**
 * Administrateurs : adresses e-mail listées dans la variable d'environnement
 * `ADMIN_EMAILS` (séparées par des virgules), lue uniquement par le serveur.
 * Rien en base : impossible de s'attribuer le rôle depuis l'application.
 */
export function parseAdminEmails(value: string | undefined): Set<string> {
  return new Set(
    (value ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0),
  );
}

export function isAdminEmail(
  email: string | null,
  admins: ReadonlySet<string>,
): boolean {
  return email !== null && admins.has(email.trim().toLowerCase());
}
