/** Fuseau du jeu : les missions changent à minuit, heure de Paris, pour tous les joueurs. */
export const GAME_TIME_ZONE = "Europe/Paris";

// Le format canadien écrit directement AAAA-MM-JJ.
const DAY_KEY_FORMAT = new Intl.DateTimeFormat("fr-CA", {
  timeZone: GAME_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/**
 * Clé du jour (AAAA-MM-JJ) à l'heure de Paris, quel que soit le fuseau de la
 * machine : le serveur tourne en UTC, le joueur peut être n'importe où.
 */
export function toDayKey(date: Date): string {
  return DAY_KEY_FORMAT.format(date);
}

const DAY_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const MINUTE_MS = 60_000;

const OFFSET_FORMAT = new Intl.DateTimeFormat("en-US", {
  timeZone: GAME_TIME_ZONE,
  timeZoneName: "longOffset",
});

/** Décalage de Paris par rapport à UTC à l'instant donné, en minutes (+60 ou +120). */
function parisOffsetMinutes(instant: number): number {
  const name =
    OFFSET_FORMAT.formatToParts(instant).find(
      (part) => part.type === "timeZoneName",
    )?.value ?? "GMT";
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

/**
 * Instant (ms Unix) de minuit, heure de Paris, du jour `dayKey` (AAAA-MM-JJ).
 * Tient compte des changements d'heure. `null` si la date est invalide.
 */
export function parisMidnight(dayKey: string): number | null {
  const match = DAY_KEY_PATTERN.exec(dayKey);
  if (!match) return null;
  const [year, month, day] = [
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  ];
  const utcMidnight = Date.UTC(year, month - 1, day);
  if (toUtcDayKey(utcMidnight) !== dayKey) return null;
  // Minuit à Paris tombe la veille au soir en UTC : on retire le décalage du moment.
  const guess = utcMidnight - parisOffsetMinutes(utcMidnight) * MINUTE_MS;
  return utcMidnight - parisOffsetMinutes(guess) * MINUTE_MS;
}

/** Jour suivant d'une clé AAAA-MM-JJ. */
export function nextDayKey(dayKey: string): string {
  const match = DAY_KEY_PATTERN.exec(dayKey);
  if (!match) throw new Error(`Jour invalide : ${dayKey}`);
  const DAY_MS = 24 * 60 * MINUTE_MS;
  return toUtcDayKey(
    Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) + DAY_MS,
  );
}

function toUtcDayKey(instant: number): string {
  return new Date(instant).toISOString().slice(0, 10);
}

/** Nombre de jours de `from` à `to` (clés AAAA-MM-JJ) ; négatif si `to` précède `from`. */
export function daysBetween(from: string, to: string): number {
  const start = parisMidnight(from);
  const end = parisMidnight(to);
  if (start === null || end === null)
    throw new Error(`Jour invalide : ${from} ou ${to}`);
  // Arrondi : un jour de changement d'heure dure 23 ou 25 heures.
  return Math.round((end - start) / (24 * 60 * MINUTE_MS));
}

const HOUR_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  timeZone: GAME_TIME_ZONE,
  hour: "numeric",
  hourCycle: "h23",
});

/** Heure (0 à 23) à Paris à l'instant donné. */
export function parisHour(date: Date): number {
  // En français, l'heure s'écrit « 22 h » : on ne garde que le nombre.
  const hour = HOUR_FORMAT.formatToParts(date).find(
    (part) => part.type === "hour",
  );
  return Number(hour?.value ?? 0);
}

/**
 * Mois (heure de Paris) contenant le jour `dayKey`, décalé de `offset` mois :
 * sa clé AAAA-MM et ses bornes (début inclus, fin exclue, ms Unix).
 */
export function parisMonth(
  dayKey: string,
  offset = 0,
): { readonly key: string; readonly start: number; readonly end: number } {
  const match = DAY_KEY_PATTERN.exec(dayKey);
  if (!match) throw new Error(`Jour invalide : ${dayKey}`);
  const first = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1 + offset, 1),
  );
  const next = new Date(
    Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 1),
  );
  const key = first.toISOString().slice(0, 7);
  return {
    key,
    start: parisMidnight(`${key}-01`)!,
    end: parisMidnight(toUtcDayKey(next.getTime()))!,
  };
}
