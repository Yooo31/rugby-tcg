import { type ClubIdentity, WIKI } from "./shared";
/** Top 14, Pro D2 et Nationale : relus club par club. */
export const ELITE_IDENTITIES: Readonly<Record<string, ClubIdentity>> = {
  // ——— Top 14 ———
  "stade-toulousain": {
    colors: ["rouge", "noir"],
    initials: "ST",
    crest: { pattern: "chief", symbol: "cross" }, // croix occitane
    source: `${WIKI} ; FFR : Noir, Rouge`,
  },
  "section-paloise": {
    colors: ["vert", "blanc"],
    initials: "SP",
    crest: { pattern: "sash", symbol: "mountain" }, // Pyrénées
    source: WIKI,
  },
  "union-bordeaux-begles": {
    colors: ["bordeaux", "blanc"],
    initials: "UBB",
    crest: { pattern: "chevron", symbol: "grapes" }, // vignoble
    source: `${WIKI} ; FFR : Blanc, Bleu, Bordeaux`,
  },
  "stade-rochelais": {
    colors: ["noir", "jaune"],
    initials: "SR",
    crest: { pattern: "hoops", symbol: "wave" }, // port atlantique
    source: `${WIKI} ; FFR : Noir, Jaune`,
  },
  "aviron-bayonnais": {
    colors: ["bleu ciel", "blanc"],
    initials: "AB",
    crest: { pattern: "halves", symbol: "ball" },
    source: `${WIKI} ; FFR : Blanc, Bleu ciel`,
  },
  "stade-francais-paris": {
    colors: ["rose", "blanc"],
    initials: "SFP",
    crest: { pattern: "sash", symbol: "star" },
    source: WIKI,
  },
  "montpellier-hr": {
    colors: ["bleu marine", "bleu ciel"],
    initials: "MHR",
    crest: { pattern: "chief", symbol: "sun" }, // Méditerranée
    source: WIKI,
  },
  "lyon-ou": {
    colors: ["rouge", "noir"],
    initials: "LOU",
    crest: { pattern: "halves", symbol: "crown" },
    source: `${WIKI} ; FFR : Rouge, Noir`,
  },
  // « Sang et or » : l'infobox mêle les anciennes couleurs des Arlequins.
  "usa-perpignan": {
    colors: ["or", "rouge"],
    initials: "USAP",
    crest: { pattern: "stripes" }, // bandes catalanes
    source: "Couleurs historiques du club (« sang et or »)",
  },
  "rc-toulon": {
    colors: ["rouge", "noir"],
    initials: "RCT",
    crest: { pattern: "chevron", symbol: "anchor" }, // port de la Marine
    source: `${WIKI} ; FFR : Noir, Rouge, Blanc`,
  },
  "asm-clermont": {
    colors: ["jaune", "bleu"],
    initials: "ASM",
    crest: { pattern: "chief", symbol: "volcano" }, // chaîne des Puys
    source: WIKI,
  },
  "racing-92": {
    colors: ["bleu ciel", "blanc"],
    initials: "R92",
    crest: { pattern: "hoops" }, // cerceaux ciel et blanc
    source: WIKI,
  },
  "castres-olympique": {
    colors: ["bleu", "blanc"],
    initials: "CO",
    crest: { pattern: "pale", symbol: "tower" },
    source: `${WIKI} ; FFR : Blanc, Bleu roi`,
  },
  "rc-vannes": {
    colors: ["bleu", "blanc"],
    initials: "RCV",
    crest: { pattern: "quarterly", symbol: "ermine" }, // hermine bretonne
    source: WIKI,
  },

  // ——— Pro D2 ———
  "oyonnax-rugby": {
    colors: ["noir", "rouge"],
    initials: "USO",
    crest: { symbol: "mountain" }, // Jura
    source: WIKI,
  },
  "provence-rugby": {
    colors: ["noir", "blanc"],
    initials: "PR",
    crest: { symbol: "sun" },
    source: `${WIKI} et FFR : Noir (blanc en seconde)`,
  },
  "ca-brive": {
    colors: ["noir", "blanc"],
    initials: "CAB",
    crest: { symbol: "tree" }, // chênes de Corrèze
    source: WIKI,
  },
  "fc-grenoble": {
    colors: ["bleu", "rouge"],
    initials: "FCG",
    crest: { pattern: "halves", symbol: "mountain" }, // Alpes
    source: WIKI,
  },
  "biarritz-olympique": {
    colors: ["rouge", "blanc"],
    initials: "BO",
    crest: { pattern: "hoops", symbol: "wave" }, // côte basque
    source: `${WIKI} ; FFR : Blanc, Rouge`,
  },
  "us-montauban": {
    colors: ["vert", "noir"],
    initials: "USM",
    crest: { symbol: "crown" },
    source: WIKI,
  },
  "soyaux-angouleme-xv": {
    colors: ["violet", "blanc"],
    initials: "SAXV",
    crest: { symbol: "star" },
    source: WIKI,
  },
  "us-dax": {
    colors: ["rouge", "blanc"],
    initials: "USD",
    crest: { symbol: "bull" }, // feria
    source: WIKI,
  },
  "valence-romans-dr": {
    colors: ["blanc", "noir", "rouge"],
    initials: "VRDR",
    crest: { symbol: "ball" },
    source: `${WIKI} ; FFR : Rouge, Noir, Blanc`,
  },
  "stade-aurillacois": {
    colors: ["rouge", "bleu"],
    initials: "SA",
    crest: { symbol: "volcano" }, // monts du Cantal
    source: WIKI,
  },
  "nissa-rugby": {
    colors: ["noir", "rouge", "blanc"],
    initials: "NR",
    crest: { symbol: "anchor" }, // port de Nice
    source: WIKI,
  },
  "su-agen": {
    colors: ["bleu", "blanc"],
    initials: "SUA",
    crest: { symbol: "sun" },
    source: `${WIKI} ; FFR : Blanc, Bleu`,
  },
  "rc-narbonne": {
    colors: ["orange", "noir"],
    initials: "RCN",
    crest: { symbol: "tower" },
    source: WIKI,
  },
  "as-beziers": {
    colors: ["rouge", "bleu"],
    initials: "ASBH",
    crest: { symbol: "grapes" }, // vignoble de l'Hérault
    source: `${WIKI} ; FFR : Bleu, Rouge`,
  },
  "colomiers-rugby": {
    colors: ["bleu", "blanc"],
    initials: "USC",
    crest: { symbol: "cross" }, // croix occitane
    source: `${WIKI} ; FFR : Blanc, Bleu nuit, Bleu roi`,
  },
  "uso-nevers": {
    colors: ["jaune", "bleu"],
    initials: "USON",
    crest: { pattern: "chief", symbol: "tower" },
    source: WIKI,
  },

  // ——— Nationale ———
  "rc-massy": {
    colors: ["bleu ciel", "noir"],
    initials: "RCME",
    source: `${WIKI} ; FFR : Bleu, Noir`,
  },
  "sc-albi": {
    colors: ["jaune", "noir"],
    initials: "SCA",
    source: `${WIKI} ; FFR : Jaune, Noir`,
  },
  "so-chambery": {
    colors: ["jaune", "noir"],
    initials: "SOC",
    source: WIKI,
  },
  "us-carcassonne": {
    colors: ["jaune", "noir"],
    initials: "USC",
    source: WIKI,
  },
  "rouen-nr": {
    colors: ["noir", "rouge"],
    initials: "RNR",
    source: WIKI,
  },
  "stade-montois": {
    colors: ["jaune", "noir"],
    initials: "SM",
    source: `${WIKI} ; FFR : Jaune, Noir`,
  },
  "rc-orleans": {
    colors: ["noir", "rouge", "jaune"],
    initials: "RCO",
    source: WIKI,
  },
  "cs-bourgoin-jallieu": {
    colors: ["bleu ciel", "grenat"],
    initials: "CSBJ",
    source: `${WIKI} ; FFR : Ciel, Grenat`,
  },
  "ca-perigueux": {
    colors: ["bleu ciel", "blanc"],
    initials: "CAP",
    source: WIKI,
  },
  "rennes-ec": {
    colors: ["noir", "blanc"],
    initials: "REC",
    source: WIKI,
  },
  "rc-suresnes": {
    colors: ["vert", "noir"],
    initials: "RCS",
    source: WIKI,
  },
  "cs-vienne": {
    colors: ["bleu ciel", "blanc"],
    initials: "CSV",
    source: WIKI,
  },
  "us-bressane": {
    colors: ["violet"],
    initials: "USB",
    source: `${WIKI} et FFR : Violet (blanc en seconde)`,
  },
  "olympique-marcquois": {
    colors: ["bleu", "jaune"],
    initials: "OMR",
    source: WIKI,
  },
};
