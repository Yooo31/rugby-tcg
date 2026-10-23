/**
 * Corrections saisies à la main, pour ce que les sources ne donnent pas.
 * Clé : code court du club dans Wikipédia (« ru Mâcon »).
 */

interface Location {
  readonly city: string;
  readonly department: string;
}

/** Clubs dont Wikidata ne donne pas la commune. À vérifier à chaque saison. */
export const LOCATION_OVERRIDES: Readonly<Record<string, Location>> = {
  "ru Mâcon": { city: "Mâcon", department: "71" },
  "ru Tricastin": { city: "Saint-Paul-Trois-Châteaux", department: "26" },
  "ru Gennevilliers": { city: "Gennevilliers", department: "92" },
  "ru Boulogne-Billancourt": { city: "Boulogne-Billancourt", department: "92" },
  "ru Véore": { city: "Beaumont-lès-Valence", department: "26" },
  "ru Marseille RM": { city: "Marseille", department: "13" },
  "ru Magnoac": { city: "Castelnau-Magnoac", department: "65" },
  "ru Orléans-La Source": { city: "Orléans", department: "45" },
};

/** Clubs volontairement écartés, avec la raison. */
export const EXCLUDED_CLUBS: Readonly<Record<string, string>> = {
  "ru Servette": "club de Genève : hors des départements français du modèle",
};
