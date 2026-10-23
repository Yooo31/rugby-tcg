const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;

const pad = (value: number) => String(value).padStart(2, "0");

/** Durée restante au format d'un chronomètre de match : « 2:14:05 », ou « 14:05 » sous une heure. */
export function formatCountdown(milliseconds: number): string {
  const remaining = Math.max(0, milliseconds);
  const hours = Math.floor(remaining / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((remaining % MINUTE_MS) / SECOND_MS);
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${pad(minutes)}:${pad(seconds)}`;
}
