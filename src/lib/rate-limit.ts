/**
 * Limite de débit : au plus `limit` appels par clé sur `windowMs`. Elle
 * protège la base d'un script qui enchaînerait les actions.
 *
 * Le serveur utilise la version Postgres (`@/data/server`), partagée par
 * toutes ses instances ; celle-ci, en mémoire, sert aux tests et au mock.
 */
export interface RateLimiter {
  /** Compte un appel ; `false` s'il dépasse la limite. */
  take(key: string): Promise<boolean>;
}

interface RateLimiterOptions {
  readonly limit: number;
  readonly windowMs: number;
  readonly now?: () => number;
}

/** Nombre de clés au-delà duquel on purge les fenêtres expirées. */
const PURGE_THRESHOLD = 10_000;

/** Limiteur à fenêtre glissante, en mémoire (propre à une instance). */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  const recent = (key: string, at: number) =>
    (hits.get(key) ?? []).filter((time) => at - time < windowMs);

  return {
    async take(key) {
      const at = now();
      if (hits.size > PURGE_THRESHOLD) {
        for (const known of hits.keys()) {
          if (recent(known, at).length === 0) hits.delete(known);
        }
      }
      const window = recent(key, at);
      if (window.length >= limit) {
        hits.set(key, window);
        return false;
      }
      hits.set(key, [...window, at]);
      return true;
    },
  };
}
