import type { ClubColorName } from "../palette";
import type { ClubIdentity } from "./index";

export type { ClubIdentity };

export const WIKI = "Wikipédia (infobox)";

export const ONE_COLOR =
  "La FFR ne donne qu'une couleur : la seconde est à confirmer.";

/** Club dont une seule couleur est connue : le blanc complète, à confirmer. */
export function oneColor(
  color: ClubColorName,
  initials: string,
  source: string,
): ClubIdentity {
  return { colors: [color], initials, source, toConfirm: ONE_COLOR };
}

/**
 * Club dont aucune source ne donne les couleurs : blason gris et blanc,
 * volontairement neutre pour qu'il se repère, plutôt que des couleurs
 * inventées.
 */
export function unknownColors(initials: string): ClubIdentity {
  return {
    colors: ["gris", "blanc"],
    initials,
    source: "Aucune source trouvée (ni FFR ni Wikipédia)",
    toConfirm: "Couleurs inconnues : à confirmer.",
  };
}
