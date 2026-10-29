/** Pages d'authentification : accessibles sans session, inutiles avec. */
export const SIGN_IN_PATH = "/connexion";
export const SIGN_UP_PATH = "/inscription";
export const FORGOT_PASSWORD_PATH = "/mot-de-passe-oublie";
/** Page où l'on choisit un nouveau mot de passe, une fois connecté par le lien reçu. */
export const UPDATE_PASSWORD_PATH = "/compte/mot-de-passe";
export const AUTH_CALLBACK_PATH = "/auth/confirm";
export const HOME_PATH = "/";
export const PRIVACY_PATH = "/confidentialite";
export const LEGAL_NOTICE_PATH = "/mentions-legales";
export const TERMS_OF_USE_PATH = "/cgu";
export const TERMS_OF_SALE_PATH = "/cgv";
export const ODDS_PATH = "/probabilites";

/** Pages d'information, lisibles avec ou sans session (obligations légales). */
const OPEN_PATHS: readonly string[] = [
  PRIVACY_PATH,
  LEGAL_NOTICE_PATH,
  TERMS_OF_USE_PATH,
  TERMS_OF_SALE_PATH,
  ODDS_PATH,
];

const GUEST_ONLY_PATHS: readonly string[] = [
  SIGN_IN_PATH,
  SIGN_UP_PATH,
  FORGOT_PASSWORD_PATH,
];

/** Pages réservées aux visiteurs non connectés. */
export function isGuestOnlyPath(pathname: string): boolean {
  return GUEST_ONLY_PATHS.includes(pathname);
}

/** Pages accessibles sans session : visiteurs, pages légales et retour des liens reçus par e-mail. */
export function isPublicPath(pathname: string): boolean {
  return (
    isGuestOnlyPath(pathname) ||
    OPEN_PATHS.includes(pathname) ||
    pathname.startsWith("/auth/") ||
    // Tâches planifiées : sans session, protégées par leur propre secret.
    pathname.startsWith("/api/cron/")
  );
}

/**
 * Destination après connexion, lue dans l'URL. On n'accepte qu'un chemin
 * interne : une adresse complète enverrait le joueur sur un site tiers.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  ) {
    return HOME_PATH;
  }
  return next;
}
