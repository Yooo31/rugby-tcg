import { timingSafeEqual } from "node:crypto";

/**
 * L'en-tête `Authorization` porte-t-il le bon secret ? Comparaison en temps
 * constant : la durée de la réponse ne trahit pas le secret.
 */
export function isCronAuthorized(
  header: string | null,
  secret: string | undefined,
): boolean {
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header ?? "");
  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}
