import { GAME_TIME_ZONE } from "@/lib/dates";

const DATE_TIME = new Intl.DateTimeFormat("fr-FR", {
  timeZone: GAME_TIME_ZONE,
  dateStyle: "medium",
  timeStyle: "short",
});

/** Date et heure de Paris, pour les écrans d'administration. */
export function formatDateTime(instant: Date | number): string {
  return DATE_TIME.format(instant);
}

/** Part en pourcentage, une décimale ; « – » sans dénominateur. */
export function formatPercent(part: number, total: number): string {
  if (total === 0) return "–";
  // Espace insécable : « % » ne passe jamais seul à la ligne.
  return `${((part / total) * 100).toFixed(1).replace(".", ",")}\u00a0%`;
}

const DAY = new Intl.DateTimeFormat("fr-FR", {
  timeZone: "UTC",
  weekday: "short",
  day: "numeric",
  month: "short",
});

/** Jour AAAA-MM-JJ lisible (« jeu. 22 oct. »). */
export function formatDay(dayKey: string): string {
  return DAY.format(new Date(`${dayKey}T12:00:00Z`));
}
