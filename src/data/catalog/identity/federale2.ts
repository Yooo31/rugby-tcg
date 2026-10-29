import { oneColor, unknownColors, WIKI, type ClubIdentity } from "./shared";

/** Fédérale 2 : relue club par club. */
export const FEDERALE_2_IDENTITIES: Readonly<Record<string, ClubIdentity>> = {
  "csm-gennevilliers": {
    colors: ["noir", "blanc"],
    initials: "CSMG",
    source: `${WIKI} ; FFR (CS M Gennevillois) : Noir`,
  },
  "rc-pays-de-meaux": {
    colors: ["blanc", "bleu roi"],
    initials: "RCPM",
    source: `FFR : Blanc, Blanc cassé, Bleu roi`,
  },
  "rc-clermont-cournon": {
    colors: ["blanc", "rouge"],
    initials: "RCCC",
    source: `FFR : Blanc, Rouge`,
  },
  "bourges-xv": {
    colors: ["rouge", "blanc"],
    initials: "BXV",
    source: `FFR (Bourges XV) ; logo du club (page FFR)`,
  },
  "scuf-rugby": {
    colors: ["noir", "blanc"],
    initials: "SCUF",
    source: `${WIKI} ; FFR : Blanc, Noir`,
  },
  "us-ris-orangis": {
    colors: ["bleu", "jaune"],
    initials: "USRO",
    source: `FFR : Bleu nuit ; logo du club (page FFR)`,
  },
  "rc-vichy": {
    colors: ["jaune", "bleu"],
    initials: "RCV",
    source: `${WIKI} ; FFR : Jaune, Bleu`,
  },
  "rc-riom": {
    colors: ["bleu", "jaune"],
    initials: "RCR",
    source: `FFR (Rugby Club Riomois) : Bleu, Jaune, Or, Bleu roi`,
  },
  "cs-clichy": {
    colors: ["blanc", "rouge"],
    initials: "CSC",
    source: `FFR : Blanc, Rouge`,
  },
  "antony-metro-92": {
    colors: ["bleu", "rouge"],
    initials: "AM92",
    source: `FFR : Bleu, Rouge`,
  },
  "rc-vincennes": {
    colors: ["blanc", "bleu marine"],
    initials: "RCV",
    source: `FFR : Blanc, Bleu nuit`,
  },
  "rc-paris-15": {
    colors: ["jaune", "noir"],
    initials: "RCP",
    source: `FFR : Jaune, Noir`,
  },
  "rc-rillieux": {
    colors: ["blanc", "rouge"],
    initials: "RCR",
    source: `FFR : Blanc, Rouge`,
  },
  "saint-priest-rugby": {
    colors: ["jaune", "rouge"],
    initials: "SPR",
    source: `FFR : Jaune, Or, Sang`,
  },
  "cs-lons": {
    colors: ["rouge", "or"],
    initials: "CSL",
    source: `${WIKI} : sang et or`,
  },
  "cs-villefranche-sur-saone": {
    colors: ["bleu ciel", "blanc"],
    initials: "CSVS",
    source: `${WIKI} : bleu et blanc ; FFR : Blanc, Bleu ciel`,
  },
  "fc-saint-claude": {
    colors: ["bleu ciel", "blanc"],
    initials: "FCSC",
    source: `${WIKI} : ciel et blanc`,
  },
  "us-meyzieu": {
    colors: ["bleu marine", "blanc"],
    initials: "USM",
    source: `FFR : Bleu ciel ; logo du club (page FFR)`,
  },
  "rcp-saint-jeannais": unknownColors("RCPS"),
  "xv-de-la-dombes": {
    colors: ["bleu marine", "rouge"],
    initials: "XVD",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
  "rugby-tango-chalonnais": {
    colors: ["orange", "blanc"],
    initials: "RTC",
    source: `FFR : Tango ; logo du club (page FFR)`,
  },
  "us-nantua-hbr": unknownColors("USN"),
  "rc-andrezieux-boutheon": {
    colors: ["bleu ciel", "bleu marine"],
    initials: "RCAB",
    source: `FFR (Rugby Club Andrézieux Bouthéon) ; logo du club (page FFR)`,
  },
  "cr-illkirch-graffenstaden": {
    colors: ["blanc", "noir"],
    initials: "CRIG",
    source: `FFR : Blanc, Noir`,
  },
  "us-vinay": {
    colors: ["bleu", "noir"],
    initials: "USV",
    source: `${WIKI} ; FFR : Bleu roi`,
  },
  "ro-grasse": {
    colors: ["grenat", "bleu"],
    initials: "ROG",
    source: `${WIKI} ; FFR : Grenat, Bleu nuit`,
  },
  "rc-aubagne": {
    colors: ["noir", "rouge", "jaune"],
    initials: "RCA",
    source: `FFR (Rugby Club Aubagnais) : Noir ; logo du club (page FFR)`,
  },
  "servian-boujan-rugby": {
    colors: ["bleu", "jaune", "rouge"],
    initials: "SBR",
    source: `FFR : Bleu, Jaune, Rouge`,
  },
  "su-cavaillon": {
    colors: ["rouge", "bleu"],
    initials: "SUC",
    source: `${WIKI} ; FFR (Stade Union Cavaillonnais) : Bleu, Rouge`,
  },
  "avignon-le-pontet-rugby": {
    colors: ["jaune", "bleu"],
    initials: "ALPR",
    source: `FFR : Jaune, Bleu`,
  },
  "so-voiron": {
    colors: ["rouge", "blanc"],
    initials: "SOV",
    source: `${WIKI} ; FFR : Blanc, Rouge`,
  },
  "rc-les-angles": {
    colors: ["vert", "blanc"],
    initials: "RCLA",
    source: `FFR : Vert ; logo du club (page FFR)`,
  },
  "stade-piscenois": {
    colors: ["violet", "blanc"],
    initials: "SP",
    source: `FFR : Violet ; logo du club (page FFR)`,
  },
  "ca-saint-raphael-frejus": {
    colors: ["jaune", "bleu"],
    initials: "CASR",
    source: `FFR : Jaune, Bleu roi`,
  },
  "us-montelimar": {
    colors: ["rouge", "bleu"],
    initials: "USM",
    source: `${WIKI}`,
  },
  "stade-marseillais-uc": {
    colors: ["noir", "gris"],
    initials: "SMUC",
    source: `${WIKI} : noir et gris`,
  },
  "us-quillan-limoux": {
    colors: ["rouge", "noir", "bleu"],
    initials: "USQL",
    source: `${WIKI} : rouge, noir et bleu ; FFR : Rouge, Vert, Bleu`,
    toConfirm: "Les sources hésitent entre noir (Wikipédia) et vert (FFR).",
  },
  "stade-beaumontois": {
    colors: ["bleu", "blanc"],
    initials: "SB",
    source: `${WIKI} ; FFR : Bleu roi`,
  },
  "corbieres-xv": {
    colors: ["rouge"],
    initials: "CXV",
    source: `FFR (Club Olympique Tauch Corbières ?) : Rouge`,
    toConfirm: "Une seule couleur, et page FFR à confirmer.",
  },
  "ua-saverdun": {
    colors: ["rouge", "noir"],
    initials: "UAS",
    source: `${WIKI} ; FFR (UA Saverdunoise) : Noir, Rouge`,
  },
  "jo-prades": {
    colors: ["bleu", "blanc"],
    initials: "JOP",
    source: `${WIKI}`,
  },
  "avenir-castaneen": {
    colors: ["rouge", "blanc"],
    initials: "AC",
    source: `${WIKI} ; FFR : Blanc, Rouge`,
  },
  "fc-villefranche": {
    colors: ["rouge", "blanc"],
    initials: "FCV",
    source: `${WIKI} ; FFR : Rouge`,
  },
  "as-vaureenne": {
    colors: ["rouge", "bleu"],
    initials: "ASV",
    source: `${WIKI} ; FFR : Bleu roi, Rouge`,
  },
  "ca-castelsarrasin": {
    colors: ["rouge", "blanc"],
    initials: "CAC",
    source: `${WIKI} ; FFR : Blanc, Rouge`,
  },
  "rc-de-la-saudrune": {
    colors: ["rouge", "noir"],
    initials: "RCS",
    source: `FFR : Noir ; logo du club (page FFR)`,
  },
  "us-caussade": {
    colors: ["bleu", "blanc"],
    initials: "USC",
    source: `FFR (US Caussadaise) : Bleu roi ; logo du club (page FFR)`,
  },
  "salanque-cote-radieuse": oneColor(
    "bleu",
    "SCR",
    `FFR (RC Salanque XV) : Bleu`,
  ),
  "sc-rieumes": {
    colors: ["bleu", "orange"],
    initials: "SCR",
    source: `FFR (SC Rieumois) ; logo du club (page FFR)`,
  },
  "us-morlaas": {
    colors: ["bleu", "blanc"],
    initials: "USM",
    source: `${WIKI} ; FFR (US Morlanaise) : Blanc, Bleu`,
  },
  "oursbelille-borderes-rc": {
    colors: ["blanc", "noir"],
    initials: "OBRC",
    source: `FFR : Blanc, Noir`,
  },
  "coq-leguevinois": {
    colors: ["rouge", "bleu marine"],
    initials: "CL",
    source: `FFR : Rouge, Bleu nuit`,
  },
  "us-argeles": {
    colors: ["bleu", "blanc"],
    initials: "USA",
    source: `FFR (US Argelésienne) : Bleu roi ; logo du club (page FFR)`,
  },
  "us-coarraze-nay": {
    colors: ["rouge", "bleu"],
    initials: "USCN",
    source: `${WIKI} ; FFR : Bleu nuit`,
  },
  "lombez-samatan-club": {
    colors: ["rouge", "blanc"],
    initials: "LSC",
    source: `${WIKI} ; FFR : Blanc, Rouge`,
  },
  "es-gimont": {
    colors: ["rouge", "blanc", "vert"],
    initials: "ESG",
    source: `${WIKI} : rouge et blanc ; FFR (ES Gimontoise) : Blanc, Rouge, Vert`,
  },
  "stade-navarrais": {
    colors: ["vert", "blanc"],
    initials: "SN",
    source: `FFR : Blanc, Vert`,
  },
  "entente-aramits-asasp": {
    colors: ["vert", "blanc", "orange"],
    initials: "EAA",
    source: `FFR : Vert ; logo du club (page FFR)`,
  },
  "usep-ger-seron-bedeille": {
    colors: ["violet", "noir"],
    initials: "USEP",
    source: `FFR : Violet, Noir`,
  },
  "gan-olympique": {
    colors: ["bleu", "blanc"],
    initials: "GO",
    source: `FFR : Blanc, Bleu`,
  },
  "hasparren-ac": {
    colors: ["vert", "blanc", "rouge"],
    initials: "HAC",
    source: `FFR : Vert ; logo du club (page FFR)`,
  },
  "us-bazas": {
    colors: ["bleu ciel", "blanc"],
    initials: "USB",
    source: `FFR (US Bazadaise) ; logo du club (page FFR)`,
  },
  "as-merignac": {
    colors: ["rouge", "bleu"],
    initials: "ASM",
    source: `${WIKI} ; FFR : Bleu roi, Rouge, Bleu nuit`,
  },
  "us-mouguerre": {
    colors: ["vert", "blanc"],
    initials: "USM",
    source: `FFR : Vert ; logo du club (page FFR)`,
  },
  "boucau-tarnos-stade": {
    colors: ["noir", "blanc"],
    initials: "BTS",
    source: `${WIKI} ; FFR : Noir`,
  },
  "rion-morcenx-cr": {
    colors: ["bleu", "blanc"],
    initials: "RMCR",
    source: `FFR : Bleu, Bleu roi ; logo du club (page FFR)`,
  },
  "us-casteljaloux": {
    colors: ["rouge", "blanc"],
    initials: "USC",
    source: `FFR : Blanc, Rouge`,
  },
  "ca-lormont": {
    colors: ["orange", "bleu"],
    initials: "CAL",
    source: `${WIKI} : orange et bleu ; FFR : Bleu roi`,
  },
  "emak-hor-rugby": {
    colors: ["rouge", "vert"],
    initials: "EHR",
    source: `FFR : Rouge, Vert`,
  },
  "stade-bordelais": {
    colors: ["bordeaux", "blanc"],
    initials: "SB",
    source: `${WIKI} ; FFR : Blanc, Bordeaux, Noir`,
  },
  "us-mugron": {
    colors: ["bleu", "rouge"],
    initials: "USM",
    source: `FFR (US Mugronnaise) : Bleu roi, Rouge`,
  },
  "us-castillon": {
    colors: ["bleu", "blanc"],
    initials: "USC",
    source: `FFR (US Castillonnaise) : Bleu ; logo du club (page FFR)`,
  },
  "so-millau": {
    colors: ["rouge", "jaune"],
    initials: "SOM",
    source: `${WIKI} : rouge et jaune ; FFR (Millau Rugby Club) : Bleu, Blanc`,
    toConfirm:
      "Les sources se contredisent (Wikipédia : rouge et jaune ; FFR : bleu et blanc).",
  },
  "rodez-rugby": {
    colors: ["rouge", "or"],
    initials: "RR",
    source: `${WIKI} : sang et or ; FFR : Jaune, Rouge`,
  },
  "ua-vergt": {
    colors: ["vert", "blanc"],
    initials: "UAV",
    source: `FFR : Blanc, Vert`,
  },
  "us-bergerac": {
    colors: ["noir", "blanc"],
    initials: "USB",
    source: `${WIKI} ; FFR : Noir`,
  },
  "usc-alban": {
    colors: ["rouge", "blanc"],
    initials: "USCA",
    source: `FFR (US Canton d'Alban) : Blanc, Rouge`,
  },
  "rc-arpajon-veinazes": {
    colors: ["bleu ciel", "blanc"],
    initials: "RCAV",
    source: `FFR : Bleu ciel ; logo du club (page FFR)`,
  },
  "stade-belvesois": {
    colors: ["rouge", "blanc"],
    initials: "SB",
    source: `FFR : Blanc, Rouge`,
  },
  "gs-figeac": {
    colors: ["rouge", "noir"],
    initials: "GSF",
    source: `${WIKI} ; FFR : Rouge`,
  },
  "sc-decazeville": {
    colors: ["bleu ciel", "blanc"],
    initials: "SCD",
    source: `${WIKI} : bleu et blanc ; FFR : Bleu ciel`,
  },
  "correze-rc": {
    colors: ["noir", "blanc"],
    initials: "CRC",
    source: `FFR : Noir ; logo du club (page FFR)`,
  },
  "cs-nontron": {
    colors: ["rouge", "bleu"],
    initials: "CSN",
    source: `FFR : Rouge, Acajou, Aqua, Argent ; logo du club (page FFR)`,
  },
  "levezou-segala-aveyron-xv": {
    colors: ["vert", "jaune"],
    initials: "LSA",
    source: `FFR : Vert, Jaune`,
  },
  "rc-roubaix": {
    colors: ["noir", "orange"],
    initials: "RCR",
    source: `FFR : Noir, Orange`,
  },
  "sc-le-rheu": {
    colors: ["jaune", "noir"],
    initials: "SCR",
    source: `${WIKI} ; FFR : Jaune, Noir`,
  },
  "fc-yonnais": {
    colors: ["rouge", "blanc"],
    initials: "FCY",
    source: `Presse locale : rouge et blanc`,
  },
  "plaisir-rc": {
    colors: ["bleu", "jaune"],
    initials: "PRC",
    source: `FFR : Bleu roi ; logo du club (page FFR)`,
  },
  "mlsgp-rugby": {
    colors: ["bleu ciel", "bleu marine"],
    initials: "MLSG",
    source: `FFR (M Laffitte St Germain Poissy) : Bleu ciel, Bleu nuit`,
  },
  "rc-amiens": {
    colors: ["bleu marine", "jaune"],
    initials: "RCA",
    source: `FFR (RC Amiénois) ; logo du club (page FFR)`,
  },
  "rc-sablais": {
    colors: ["blanc", "bleu ciel"],
    initials: "RCS",
    source: `FFR : Blanc, Azur`,
  },
  "rc-versailles": {
    colors: ["bleu", "blanc"],
    initials: "RCV",
    source: `FFR : Bleu roi ; logo du club (page FFR)`,
  },
  "evreux-ac": {
    colors: ["blanc", "rouge"],
    initials: "EAC",
    source: `FFR : Blanc, Rouge`,
  },
  "aas-sarcelles": {
    colors: ["jaune", "bleu marine"],
    initials: "AASS",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "rc-montesson-chatou": {
    colors: ["bleu", "jaune"],
    initials: "RCMC",
    source: `FFR : Blanc ; logo du club (page FFR)`,
  },
  "stade-caennais-rc": {
    colors: ["bleu ciel", "bleu", "rouge"],
    initials: "SCRC",
    source: `FFR : Bleu ciel, Bleu roi, Rouge`,
  },
};
