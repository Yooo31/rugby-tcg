import type { Club } from "@/domain";

/**
 * Identité visuelle saisie à la main, par club, appliquée sur l'import
 * Wikipédia : symbole et motif du blason, et couleurs quand l'infobox se
 * trompe. Le blason **évoque** le club (lieu, tradition, couleurs) sans
 * jamais reprendre son logo, marque protégée tant que les droits ne sont pas
 * acquis. Commencé par le Top 14 et la Pro D2 ; à étendre division par
 * division.
 */
type ClubIdentity = Partial<Pick<Club, "colors" | "crest">>;

export const CLUB_IDENTITIES: Readonly<Record<string, ClubIdentity>> = {
  // Top 14
  "stade-toulousain": { crest: { pattern: "chief", symbol: "cross" } }, // croix occitane
  "section-paloise": { crest: { pattern: "sash", symbol: "mountain" } }, // Pyrénées
  "union-bordeaux-begles": { crest: { pattern: "chevron", symbol: "grapes" } }, // vignoble
  "stade-rochelais": { crest: { pattern: "hoops", symbol: "wave" } }, // port atlantique
  "aviron-bayonnais": { crest: { pattern: "halves", symbol: "ball" } },
  "stade-francais-paris": { crest: { pattern: "sash", symbol: "star" } },
  "montpellier-hr": { crest: { pattern: "chief", symbol: "sun" } }, // Méditerranée
  "lyon-ou": { crest: { pattern: "halves", symbol: "crown" } },
  // « Sang et or » : l'infobox mêle les anciennes couleurs des Arlequins.
  "usa-perpignan": {
    colors: { primary: "#f2c14e", secondary: "#c8102e" },
    crest: { pattern: "stripes" }, // bandes catalanes
  },
  "rc-toulon": { crest: { pattern: "chevron", symbol: "anchor" } }, // port de la Marine
  "asm-clermont": { crest: { pattern: "chief", symbol: "volcano" } }, // chaîne des Puys
  "racing-92": { crest: { pattern: "hoops" } }, // cerceaux ciel et blanc
  "castres-olympique": { crest: { pattern: "pale", symbol: "tower" } },
  "rc-vannes": { crest: { pattern: "quarterly", symbol: "ermine" } }, // hermine bretonne
  // Pro D2
  "oyonnax-rugby": { crest: { symbol: "mountain" } }, // Jura
  "provence-rugby": { crest: { symbol: "sun" } },
  "ca-brive": { crest: { symbol: "tree" } }, // chênes de Corrèze
  "fc-grenoble": { crest: { pattern: "halves", symbol: "mountain" } }, // Alpes
  "biarritz-olympique": { crest: { pattern: "hoops", symbol: "wave" } }, // côte basque
  "us-montauban": { crest: { symbol: "crown" } },
  "soyaux-angouleme-xv": { crest: { symbol: "star" } },
  "us-dax": { crest: { symbol: "bull" } }, // feria
  "valence-romans-dr": { crest: { symbol: "ball" } },
  "stade-aurillacois": { crest: { symbol: "volcano" } }, // monts du Cantal
  "nissa-rugby": { crest: { symbol: "anchor" } }, // port de Nice
  "su-agen": { crest: { symbol: "sun" } },
  "rc-narbonne": { crest: { symbol: "tower" } },
  "as-beziers": { crest: { symbol: "grapes" } }, // vignoble de l'Hérault
  "colomiers-rugby": { crest: { symbol: "cross" } }, // croix occitane
  "uso-nevers": { crest: { pattern: "chief", symbol: "tower" } },
};

/** Applique l'identité saisie à la main par-dessus le club importé. */
export function withIdentity(club: Club): Club {
  const identity = CLUB_IDENTITIES[club.id];
  return identity ? { ...club, ...identity } : club;
}
