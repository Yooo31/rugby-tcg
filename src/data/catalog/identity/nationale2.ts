import { type ClubIdentity, WIKI } from "./shared";
/** Nationale 2 : relue club par club. */
export const NATIONALE_2_IDENTITIES: Readonly<Record<string, ClubIdentity>> = {
  "stade-nantais": {
    colors: ["blanc", "vert", "rouge"],
    initials: "SN",
    source: `${WIKI} ; FFR : Blanc`,
  },
  "stade-langonnais": {
    colors: ["rouge", "blanc"],
    initials: "SL",
    source: `${WIKI} ; FFR : Rouge`,
  },
  "cs-annonay": {
    colors: ["rouge", "noir"],
    initials: "CSA",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
  "rc-drancy": {
    colors: ["bleu", "jaune"],
    initials: "RCD",
    source: `${WIKI} ; FFR : Bleu roi`,
  },
  "cm-floirac": {
    colors: ["jaune", "rouge"],
    initials: "CMF",
    source: `FFR : Jaune ; sigle usuel CMF Rugby ; logo du club (page FFR)`,
  },
  "rcs-rumilly": {
    colors: ["rouge", "noir"],
    initials: "RCSR",
    source: `${WIKI} ; FFR (Rugby Club Savoie Rumilly) : Rouge`,
  },
  "us-marmande": {
    colors: ["bleu", "blanc"],
    initials: "USM",
    source: `${WIKI} ; FFR (Union Sportive Marmandaise) : Blanc, Bleu`,
  },
  "as-macon": {
    colors: ["bleu", "rouge"],
    initials: "ASM",
    source: `${WIKI} ; FFR (AS Maconnaise) : Bleu roi`,
  },
  "us-salles": {
    colors: ["blanc", "rouge"],
    initials: "USS",
    source: `${WIKI} ; FFR : Blanc, Rouge`,
  },
  "stade-metropolitain": {
    colors: ["bleu", "blanc"],
    initials: "SM",
    source: `FFR : Blanc ; logo du club (page FFR)`,
  },
  "saint-medard-rc": {
    colors: ["jaune", "noir"],
    initials: "SMRC",
    source: `${WIKI} ; FFR : Jaune, Noir`,
  },
  "saint-jean-de-luz-olympique": {
    colors: ["vert", "rouge", "blanc"],
    initials: "SJLO",
    source: `${WIKI} ; FFR : Blanc, Rouge, Vert`,
  },
  "rc-aubenas": {
    colors: ["jaune", "bleu"],
    initials: "RCAV",
    source: `${WIKI} ; FFR (RC Aubenas Vals) : Bleu, Jaune`,
  },
  "rc-nimes": {
    colors: ["rouge", "vert"],
    initials: "RCN",
    source: `${WIKI} ; FFR (Rugby Club Nîmois) : Rouge, Vert`,
  },
  "sa-mauleon": {
    colors: ["rouge", "blanc"],
    initials: "SAM",
    place: { city: "Mauléon-Licharre", department: "64" },
    source: `${WIKI} ; FFR (SA Mauléonais, 64130 Mauléon-Licharre)`,
  },
  "avenir-valencien": {
    colors: ["bleu ciel", "blanc"],
    initials: "AV",
    source: `${WIKI} : bleu et blanc ; FFR : Bleu ciel`,
  },
  "rc-auch": {
    colors: ["rouge", "blanc"],
    initials: "RCA",
    source: `${WIKI} ; FFR : Rouge`,
  },
  "sc-graulhet": {
    colors: ["rouge", "noir"],
    initials: "SCG",
    source: `${WIKI} ; FFR : Noir`,
  },
  "as-fleurance": {
    colors: ["bleu ciel", "blanc"],
    initials: "ASF",
    source: `${WIKI} : bleu et blanc ; FFR (AS Fleurantine) : Blanc, Bleu ciel`,
  },
  "us-tyrosse": {
    colors: ["rouge", "bleu"],
    initials: "UST",
    source: WIKI,
  },
  "peyrehorade-sr": {
    colors: ["vert", "blanc"],
    initials: "PSR",
    source: `${WIKI} ; FFR : Blanc, Vert`,
  },
  "rc-tricastin": {
    colors: ["jaune", "bleu"],
    initials: "RCT",
    source: `${WIKI} ; FFR : Bleu, Jaune`,
  },
  "us-seynoise": {
    colors: ["rouge", "bleu"],
    initials: "USS",
    source: `${WIKI} ; FFR : Bleu, Rouge`,
  },
};
