/** Date de fin d'un pass VIP, à l'heure de Paris. */
export const VIP_DATE_FORMAT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Paris",
});
