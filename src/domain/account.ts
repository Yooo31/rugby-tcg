/**
 * Règles du compte joueur fixées par les pages légales (confidentialité,
 * conditions d'utilisation).
 */

/** Années sans activité après lesquelles un compte est supprimé. */
export const INACTIVE_ACCOUNT_YEARS = 2;

/** Âge minimum pour jouer : la majorité numérique en France. */
export const MINIMUM_AGE = 15;

/**
 * Instant avant lequel la dernière activité rend un compte inactif. Calculé
 * au jour près, comme un anniversaire (29 février compris).
 */
export function inactiveSince(now: Date): Date {
  const limit = new Date(now);
  limit.setUTCFullYear(limit.getUTCFullYear() - INACTIVE_ACCOUNT_YEARS);
  return limit;
}
