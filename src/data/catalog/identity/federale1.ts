import type { ClubIdentity } from "./index";

const WIKI = "Wikipédia (infobox)";
const ONE_COLOR =
  "La FFR ne donne qu'une couleur : la seconde est à confirmer.";

/** Fédérale 1 : relue club par club. */
export const FEDERALE_1_IDENTITIES: Readonly<Record<string, ClubIdentity>> = {
  "sc-royannais": {
    colors: ["rouge"],
    initials: "SCR",
    source: "FFR : Rouge",
    toConfirm: ONE_COLOR,
  },
  "us-tours": {
    colors: ["orange", "bleu"],
    initials: "UST",
    source: `${WIKI} : orange tango et bleu ; FFR : Orange`,
  },
  "cs-nuiton": {
    colors: ["noisette"],
    initials: "CSN",
    source: "FFR : Noisette",
    toConfirm: ONE_COLOR,
  },
  "us-montmelian": {
    colors: ["vert", "noir"],
    initials: "USM",
    source: `${WIKI} ; FFR (US Montmélianaise) : Noir, Vert`,
  },
  "us-issoire": {
    colors: ["mauve", "noir"],
    initials: "USI",
    source: `${WIKI} ; FFR (US Issoirienne) : Mauve`,
  },
  "rc-courbevoie": {
    colors: ["bleu", "jaune"],
    initials: "RCC",
    source: "FFR : Bleu, Jaune",
  },
  "beauvais-rc": {
    colors: ["rouge"],
    initials: "BRC",
    source: "FFR (Beauvais XV RC) : Rouge, Rouge tomate",
    toConfirm: ONE_COLOR,
  },
  "paris-uc": {
    colors: ["violet", "blanc"],
    initials: "PUC",
    source: `${WIKI} ; FFR : Violette`,
  },
  "rc-auxerre": {
    colors: ["vert", "rouge"],
    initials: "RCA",
    source: "FFR (RC Auxerrois) : Vert, Rouge",
  },
  "xv-corsaire-saint-malo": {
    colors: ["blanc", "noir"],
    initials: "XVC",
    source: "Aucune source trouvée (ni FFR ni Wikipédia)",
    toConfirm: "Couleurs inconnues : à confirmer.",
  },
  "bievre-saint-geoirs-rc": {
    colors: ["noir", "rouge"],
    initials: "BSG",
    source: "FFR (AS Bièvre St Geoirs Rugby Club) : Noir, Rouge",
  },
  "us-annecy": {
    colors: ["rouge", "blanc"],
    initials: "USA",
    source: `FFR : Rouge ; ${WIKI} : bleu et blanc`,
    toConfirm:
      "Les sources se contredisent (FFR : rouge ; Wikipédia : bleu et blanc).",
  },
  "ro-agde": {
    colors: ["jaune", "bleu"],
    initials: "ROA",
    source: `${WIKI} ; FFR (Rugby Olympique Agathois) : Jaune, Bleu`,
  },
  "as-monaco": {
    colors: ["rouge", "blanc"],
    initials: "ASM",
    source: "FFR : Rouge ; blanc des couleurs de Monaco",
  },
  "sc-leucate": {
    colors: ["blanc", "bleu"],
    initials: "SCL",
    source: "FFR : Blanc, Bleu",
  },
  "sc-mazamet": {
    colors: ["bleu", "noir"],
    initials: "SCM",
    source: `${WIKI} ; FFR : Bleu`,
  },
  "ceret-sportif": {
    colors: ["bleu", "blanc", "rouge"],
    initials: "CS",
    source: `${WIKI} : bleu, blanc, rouge et jaune ; FFR : Bleu roi`,
    toConfirm:
      "Quatre couleurs selon Wikipédia : les trois retenues à confirmer.",
  },
  "rcm-palavas": {
    colors: ["orange", "bleu"],
    initials: "RCMP",
    source: "FFR (Rugby Club Méditerranée Palavas) : Orange, Bleu",
  },
  "xv-du-coudon": {
    colors: ["vert", "noir"],
    initials: "XVC",
    source: `${WIKI} ; FFR : Noir, Vert`,
  },
  "avenir-gruissanais": {
    colors: ["rouge"],
    initials: "AG",
    source: "FFR (Aviron Gruissanais) : Rouge",
    toConfirm: ONE_COLOR,
  },
  "co-berre-xv": {
    colors: ["noir", "rouge"],
    initials: "COB",
    source: "FFR : Noir, Rouge",
  },
  "sor-agout-xv": {
    colors: ["blanc"],
    initials: "SAXV",
    source: "FFR : Blanc",
    toConfirm: ONE_COLOR,
  },
  "as-bedarrides-chateauneuf-du-pape": {
    colors: ["vert", "noir", "rouge"],
    initials: "ASBC",
    source: `${WIKI} ; FFR : Vert`,
  },
  "rc-chateaurenard": {
    colors: ["rouge", "bleu"],
    initials: "RCC",
    source: `${WIKI} ; FFR : Bleu roi, Rouge`,
  },
  "blagnac-scr": {
    colors: ["rouge", "bleu"],
    initials: "BSCR",
    source: `${WIKI} ; FFR : Rouge, Bleu roi`,
  },
  "ca-sarlat": {
    colors: ["bleu", "noir", "blanc"],
    initials: "CASP",
    source: `${WIKI} : bleu et noir ; FFR (CA Sarladais Périgord Noir) : Blanc, Bleu roi, Noir`,
  },
  "us-saint-sulpice": {
    colors: ["rouge", "vert"],
    initials: "USS",
    source: WIKI,
  },
  "cahors-rugby": {
    colors: ["bleu ciel", "blanc"],
    initials: "CR",
    source: `${WIKI} : bleu et blanc ; FFR : Blanc, Bleu ciel`,
  },
  "rugby-grenade": {
    colors: ["noir", "jaune"],
    initials: "GS",
    source: "FFR (Grenade Sports) : Noir, Jaune",
  },
  "usa-limoges": {
    colors: ["bleu", "rouge"],
    initials: "USAL",
    source: `${WIKI} ; FFR : Bleu ciel, Bleu, Rouge`,
  },
  "toec-toac-fct": {
    colors: ["vert", "bleu", "blanc"],
    initials: "TTF",
    source: `${WIKI} : vert, bleu, violet et blanc ; FFR : Vert`,
    toConfirm:
      "Quatre couleurs selon Wikipédia : les trois retenues à confirmer.",
  },
  "ua-gaillac": {
    colors: ["rouge", "noir"],
    initials: "UAG",
    source: `${WIKI} ; FFR : Rouge`,
  },
  "us-l-isle-jourdain": {
    colors: ["rouge", "or"],
    initials: "USIJ",
    source: `${WIKI} : sang et or`,
  },
  "ro-castelnaudary-xv": {
    colors: ["blanc", "rouge"],
    initials: "ROC",
    source: "FFR : Blanc, Rouge",
  },
  "saint-girons-sc": {
    colors: ["vert", "noir", "blanc"],
    initials: "SGSC",
    source: `${WIKI} ; FFR : Noir, Vert`,
  },
  "sc-tulle": {
    colors: ["bleu", "blanc"],
    initials: "SCT",
    source: `${WIKI} ; FFR : Bleu roi`,
  },
  "anglet-orc": {
    colors: ["bleu", "blanc"],
    initials: "AORC",
    source: `${WIKI} ; FFR (Anglet Olympique) : Bleu roi`,
  },
  "ua-gujan-mestras": {
    colors: ["blanc", "noir"],
    initials: "UAGM",
    source: `${WIKI} ; FFR : Blanc, Noir`,
  },
  "stade-bagnerais": {
    colors: ["noir", "blanc"],
    initials: "SB",
    source: `${WIKI} ; FFR : Noir`,
  },
  "fc-oloron": {
    colors: ["bleu", "blanc"],
    initials: "FCO",
    source: `${WIKI} ; FFR : Blanc, Bleu`,
  },
  "as-soustons": {
    colors: ["bleu", "blanc"],
    initials: "ASS",
    source: `${WIKI} ; FFR : Blanc, Bleu roi`,
  },
  "us-nafarroa": {
    colors: ["rouge", "jaune"],
    initials: "USN",
    source: `${WIKI} ; FFR : Jaune, Rouge`,
  },
  "4-cantons-bhap": {
    colors: ["grenat"],
    initials: "4C",
    source: "FFR : Grenat",
    toConfirm: ONE_COLOR,
  },
  "as-pont-long": {
    colors: ["vert"],
    initials: "ASPL",
    source: "FFR : Vert",
    toConfirm: ONE_COLOR,
  },
  "fc-lourdes": {
    colors: ["rouge", "bleu"],
    initials: "FCL",
    source: `${WIKI} ; FFR : Bleu, Rouge`,
  },
  "union-barbezieux-jonzac": {
    colors: ["jaune", "rouge", "blanc"],
    initials: "UBJ",
    source: "FFR : Blanc, Jaune, Or, Rouge",
    toConfirm: "Quatre couleurs selon la FFR : les trois retenues à confirmer.",
  },
  "as-layrac": {
    colors: ["bleu"],
    initials: "ASL",
    source: "FFR (AS Layracaise) : Bleu roi",
    toConfirm: ONE_COLOR,
  },
  "ca-lannemezan": {
    colors: ["rouge", "blanc"],
    initials: "CAL",
    source: `${WIKI} ; FFR (Cercle Amical Lannemezanais) : Blanc, Rouge`,
  },
};
