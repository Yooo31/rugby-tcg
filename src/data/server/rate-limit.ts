import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import type { RateLimiter } from "@/lib/rate-limit";

/** Ancienneté au-delà de laquelle une fenêtre ne sert plus à rien. */
const STALE_AFTER_MS = 60 * 60 * 1000;
/** Part des appels qui purgent les vieilles fenêtres (pas besoin de tâche planifiée). */
const PURGE_PROBABILITY = 0.01;

interface PostgresRateLimiterOptions {
  readonly limit: number;
  readonly windowMs: number;
  readonly now?: () => number;
  readonly shouldPurge?: () => boolean;
}

/**
 * Limiteur à fenêtres fixes, compté dans Postgres : une seule requête
 * atomique par appel (`INSERT … ON CONFLICT … RETURNING`), et la même limite
 * pour toutes les instances du serveur.
 */
export function createPostgresRateLimiter(
  prisma: PrismaClient,
  {
    limit,
    windowMs,
    now = Date.now,
    shouldPurge = () => Math.random() < PURGE_PROBABILITY,
  }: PostgresRateLimiterOptions,
): RateLimiter {
  return {
    async take(key) {
      const at = now();
      const windowStart = new Date(Math.floor(at / windowMs) * windowMs);
      const [row] = await prisma.$queryRaw<{ hits: number }[]>`
        INSERT INTO rate_limits (key, window_start) VALUES (${key}, ${windowStart})
        ON CONFLICT (key, window_start) DO UPDATE SET hits = rate_limits.hits + 1
        RETURNING hits`;
      if (shouldPurge()) {
        await prisma.rateLimit.deleteMany({
          where: { windowStart: { lt: new Date(at - STALE_AFTER_MS) } },
        });
      }
      return (row?.hits ?? 0) <= limit;
    },
  };
}
