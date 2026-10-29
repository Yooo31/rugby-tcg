import { oneColor, unknownColors, WIKI, type ClubIdentity } from "./shared";

/** Fédérale 3 : relue club par club. */
export const FEDERALE_3_IDENTITIES: Readonly<Record<string, ClubIdentity>> = {
  "paris-xo": {
    colors: ["marron", "pétrole"],
    initials: "PXO",
    source: `FFR (Paris XO Rugby) : Chocolat, Pétrole`,
  },
  "rugby-aulnay-club": {
    colors: ["jaune", "rouge"],
    initials: "RAC",
    source: `FFR : Jaune, Rouge`,
  },
  "lille-rc-iris": {
    colors: ["rouge", "or"],
    initials: "LRCI",
    source: `${WIKI} : sang et or ; FFR : Rouge`,
  },
  "rc-arras": {
    colors: ["bleu", "rouge"],
    initials: "RCA",
    source: `${WIKI} ; FFR : Bleu`,
  },
  "ac-boulogne-billancourt": {
    colors: ["orange", "gris"],
    initials: "ACBB",
    source: `${WIKI} : orange et gris ; FFR : Orchidée, Orange`,
  },
  "le-havre-ac": {
    colors: ["bleu ciel", "bleu marine"],
    initials: "HAC",
    source: `${WIKI} ; FFR : Bleu ciel, Marine`,
  },
  "rca-cergy-pontoise": {
    colors: ["noir", "jaune"],
    initials: "RCA",
    source: `${WIKI} ; FFR : Noir`,
  },
  "ru-dunkerque-littoral": {
    colors: ["jaune", "noir"],
    initials: "RUDL",
    source: `FFR : Jaune, Or, Noir`,
  },
  "sc-bernay": {
    colors: ["bleu", "blanc"],
    initials: "SCB",
    source: `FFR : Bleu roi ; logo du club (page FFR)`,
  },
  "rc-yvetot": {
    colors: ["blanc", "bleu roi"],
    initials: "RCY",
    source: `FFR (RC Yvetotais) : Blanc, Bleu roi`,
  },
  "gretz-tournan-ozoir-rc-77": {
    colors: ["noir", "bleu", "vert"],
    initials: "GTO",
    source: `FFR : Noir ; logo du club (page FFR)`,
  },
  "rc-metz": {
    colors: ["noir", "blanc"],
    initials: "RCM",
    source: `${WIKI} ; FFR : Blanc, Noir`,
  },
  "rc-sucy-en-brie": {
    colors: ["bleu", "rouge"],
    initials: "RCS",
    source: `FFR : Bleu, Rouge`,
  },
  "stade-pontellois": {
    colors: ["jaune", "bleu"],
    initials: "SP",
    source: `FFR : Jaune, Bleu`,
  },
  "nancy-seichamps-rugby": unknownColors("NSR"),
  "rugby-epernay-champagne": {
    colors: ["bleu", "blanc"],
    initials: "REC",
    source: `${WIKI} ; FFR : Bleu`,
  },
  "fc-haguenau": {
    colors: ["bleu", "blanc"],
    initials: "FCH",
    source: `FFR (Rugby Club Haguenau) : Blanc, Bleu ; logo du club (page FFR)`,
  },
  "rc-pont-a-mousson": {
    colors: ["blanc", "bleu"],
    initials: "RCPM",
    source: `FFR : Blanc, Bleu`,
  },
  "rugby-melun-combs-senart-77": {
    colors: ["blanc", "noir"],
    initials: "RMCS",
    source: `FFR : Blanc, Noir`,
  },
  "rc-strasbourg": {
    colors: ["bleu marine", "blanc", "rose"],
    initials: "RCS",
    source: `${WIKI} : bleu marine, blanc et rose`,
  },
  "grand-dole-rugby": {
    colors: ["rouge", "blanc"],
    initials: "GDR",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
  "stade-dijonnais": {
    colors: ["rouge", "bleu"],
    initials: "SD",
    source: `${WIKI} ; FFR : Bleu, Rouge`,
  },
  "co-le-creusot": {
    colors: ["bleu", "rouge"],
    initials: "COC",
    source: `${WIKI} ; FFR : Bleu roi, Rouge`,
  },
  "us-bellegarde-coupy": {
    colors: ["vert", "blanc"],
    initials: "USBC",
    source: `FFR : Vert, Blanc`,
  },
  "cs-beaune": {
    colors: ["bleu", "blanc"],
    initials: "CSB",
    source: `${WIKI} ; FFR (CS Beaunois) : Bleu nuit`,
  },
  "ca-pontarlier": {
    colors: ["bleu", "jaune"],
    initials: "CAP",
    source: `FFR : Bleu roi, Jaune`,
  },
  "rc-montceau-bourgogne": {
    colors: ["blanc", "rouge"],
    initials: "RCMB",
    source: `FFR : Blanc, Rouge`,
  },
  "rc-louhans": unknownColors("RCL"),
  "rc-viriat": {
    colors: ["orange", "noir"],
    initials: "RCV",
    source: `FFR : Orange, Noir`,
  },
  "stade-montchaninois-bourgogne": {
    colors: ["bleu ciel", "blanc"],
    initials: "SMB",
    source: `${WIKI} ; FFR : Bleu ciel, Blanc`,
  },
  "as-ampuis-cote-rotie": {
    colors: ["noir", "rouge"],
    initials: "ASAC",
    source: `FFR : Noir, Rouge`,
  },
  "as-saint-marcel-isle-d-abeau": unknownColors("ASMI"),
  "us-beaurepaire": {
    colors: ["rouge", "noir"],
    initials: "USB",
    source: `${WIKI} ; FFR (US Beaurepairoise) : Noir, Rouge`,
  },
  "sc-tarare": {
    colors: ["blanc", "bleu"],
    initials: "SCT",
    source: `FFR : Blanc, Bleu`,
  },
  "rc-belleville-beaujolais": {
    colors: ["rouge", "blanc", "noir"],
    initials: "RCBB",
    source: `FFR (RC Bellevillois) ; logo du club (page FFR)`,
  },
  "saint-savin-sportif": {
    colors: ["jaune", "noir"],
    initials: "SSS",
    source: `FFR : Jaune ; logo du club (page FFR)`,
  },
  "fc-aix-les-bains": {
    colors: ["jaune", "noir"],
    initials: "FCAB",
    source: `${WIKI} ; FFR : Jaune, Noir`,
  },
  "rc-des-vallons-de-la-tour": unknownColors("RCVT"),
  "co-le-puy": {
    colors: ["noir", "rouge"],
    initials: "COP",
    source: `FFR : Noir, Rouge`,
  },
  "rc-motterain": {
    colors: ["bleu marine", "rouge", "blanc"],
    initials: "RCM",
    source: `FFR : Bleu, Rouge, Tomate, Blanc, Bleu roi, Rouge ; logo du club (page FFR)`,
  },
  "ent-chateauneuf-st-marcel-xv": {
    colors: ["vert", "blanc", "noir"],
    initials: "ECSM",
    source: `FFR : Vert, Blanc, Noir`,
  },
  "us-veore-xv": {
    colors: ["violet", "jaune"],
    initials: "USV",
    source: `FFR : Violet, Prune, Violette, Jaune`,
  },
  "ent-vaulnaveys-vizille": {
    colors: ["violet", "blanc"],
    initials: "EVV",
    source: `FFR (ES Vaulnaveys) : Violet ; logo du club (page FFR)`,
  },
  "bassin-de-crussol-rugby": {
    colors: ["bleu", "jaune"],
    initials: "BCR",
    source: `FFR : Bleu, Jaune`,
  },
  "rc-teillois": {
    colors: ["bleu", "rouge"],
    initials: "RCT",
    source: `FFR : Bleu, Rouge`,
  },
  "saint-marcellin-sports": {
    colors: ["bleu marine", "bleu ciel"],
    initials: "SMS",
    source: `FFR : Bleu ciel ; logo du club (page FFR)`,
  },
  "fc-tournon-tain": {
    colors: ["rouge", "blanc"],
    initials: "FCTT",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
  "ua-tullins-fures": {
    colors: ["rouge", "blanc"],
    initials: "UATF",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
  "rc-seyssins": {
    colors: ["noir", "blanc"],
    initials: "RCS",
    source: `FFR (RC Seyssinois) ; logo du club (page FFR)`,
  },
  "us-renage-rives": {
    colors: ["jaune", "bleu"],
    initials: "USRR",
    source: `FFR : Bleu roi ; logo du club (page FFR)`,
  },
  "rc-draguignan": {
    colors: ["vert", "vert clair"],
    initials: "RCD",
    source: `FFR : Vert, Printemps`,
  },
  "us-valreas": {
    colors: ["rouge", "noir"],
    initials: "USV",
    source: `FFR (US Valréassienne) : Noir ; logo du club (page FFR)`,
  },
  "es-saint-saturnin": {
    colors: ["rouge", "jaune"],
    initials: "ESSS",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
  "rc-lucciana": {
    colors: ["noir", "rouge"],
    initials: "RCL",
    source: `FFR : Noir, Rouge`,
  },
  "rc-jacou": {
    colors: ["jaune", "bleu marine"],
    initials: "RCJ",
    source: `FFR : Jaune, Or, Bleu nuit`,
  },
  "marseille-rm": {
    colors: ["bleu ciel", "blanc"],
    initials: "MRM",
    source: `${WIKI} : ciel et blanc ; FFR (Marseille Rugby Méditerranée) : Blanc, Bleu`,
  },
  "sc-salon": {
    colors: ["jaune", "noir"],
    initials: "SCS",
    source: `FFR (SC Salonais) : Jaune, Noir`,
  },
  "rc-vallee-du-gapeau": {
    colors: ["jaune", "noir"],
    initials: "RCVG",
    source: `FFR : Jaune, Noir`,
  },
  "ca-bedarieux-gor": {
    colors: ["bleu", "jaune"],
    initials: "CABG",
    source: `FFR : Jaune ; logo du club (page FFR)`,
  },
  "rc-dignois": {
    colors: ["bleu", "rouge"],
    initials: "RCD",
    source: `FFR : Bleu, Rouge`,
  },
  "ent-vendres-lespignan": {
    colors: ["vert", "blanc"],
    initials: "EVL",
    source: `FFR : Vert, Blanc`,
  },
  "us-thuir": {
    colors: ["vert", "blanc"],
    initials: "UST",
    source: `${WIKI} ; FFR (US Thuirinoise) : Vert`,
  },
  "rivesaltes-baixas-espira-agly-xv": {
    colors: ["rouge", "jaune", "bleu"],
    initials: "RBEA",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "ent-vallee-du-girou": {
    colors: ["bleu", "blanc"],
    initials: "EVG",
    source: `${WIKI} ; FFR : Bleu`,
  },
  "etoile-sportive-catalane": {
    colors: ["rouge", "blanc"],
    initials: "ESC",
    source: `${WIKI} ; FFR : Rouge`,
  },
  "rc-sete": {
    colors: ["bleu", "blanc"],
    initials: "RCS",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "balma-orc": {
    colors: ["blanc", "rouge"],
    initials: "BORC",
    source: `FFR (Balma Olympique RC) : Blanc, Rouge`,
  },
  "js-illiberienne": {
    colors: ["bleu ciel", "jaune"],
    initials: "JSI",
    source: `FFR : Bleu roi ; logo du club (page FFR)`,
  },
  "saint-juery-aoxv": {
    colors: ["blanc", "rouge", "vert"],
    initials: "SJAO",
    source: `FFR (St Juéry Arthès Ol. Rugby) : Blanc, Rouge, Vert`,
  },
  "as-olonzac-minervois": {
    colors: ["bleu", "noir"],
    initials: "ASOM",
    source: `FFR : Bleu roi, Noir`,
  },
  "us-tarascon-xv": {
    colors: ["blanc", "rouge"],
    initials: "UST",
    source: `FFR : Blanc, Rouge`,
  },
  "magnoac-fc": {
    colors: ["rouge", "blanc"],
    initials: "MFC",
    source: `FFR : Rouge, Blanc`,
  },
  "sc-pamiers": {
    colors: ["noir", "blanc"],
    initials: "SCP",
    source: `${WIKI}`,
  },
  "union-cazeres-le-fousseret": {
    colors: ["bleu", "noir", "rouge"],
    initials: "UCF",
    source: `FFR : Bleu, Noir, Rouge`,
  },
  "us-coteaux-pouyastruc": {
    colors: ["jaune", "noir"],
    initials: "USCP",
    source: `FFR : Jaune, Noir`,
  },
  "rc-salvetat-plaisance": {
    colors: ["jaune", "bleu"],
    initials: "RCSP",
    source: `FFR : Bleu, Jaune ; ordre donné par l'éditeur (jaune et bleu)`,
  },
  "as-tournefeuille": {
    colors: ["bleu", "noir"],
    initials: "AST",
    source: `${WIKI} ; FFR : Bleu`,
  },
  "us-vicquoise": unknownColors("USV"),
  "us-l-isle-en-dodon": unknownColors("USID"),
  "ent-astarac-bigorre": {
    colors: ["bleu", "blanc"],
    initials: "EAB",
    source: `FFR (Ent. Rugby Miélan Mirande Rabastens) : Bleu ; logo du club (page FFR)`,
  },
  "stade-hendayais": {
    colors: ["blanc", "noir"],
    initials: "SH",
    source: `${WIKI} ; FFR : Blanc`,
  },
  "barcus-menditte-xiberoa": {
    colors: ["noir", "jaune"],
    initials: "BMX",
    source: `FFR (US Menditte) : Jaune, Noir ; logo du club (page FFR)`,
  },
  "avenir-bizanos": {
    colors: ["jaune", "noir"],
    initials: "AB",
    source: `${WIKI} ; FFR : Jaune, Noir`,
  },
  "stado-tarbes-pr": {
    colors: ["rouge", "blanc"],
    initials: "STPR",
    source: `${WIKI} ; FFR : Rouge, Tomate`,
  },
  "oo-laruns": {
    colors: ["bleu", "blanc"],
    initials: "OOL",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "us-josbaig": {
    colors: ["jaune", "noir"],
    initials: "USJ",
    source: `FFR : Jaune, Or ; logo du club (page FFR)`,
  },
  "es-arudy": {
    colors: ["bleu", "jaune"],
    initials: "ESA",
    source: `FFR (ES Arudyenne) : Bleu roi, Jaune`,
  },
  "as-bayonne": {
    colors: ["violet", "vert"],
    initials: "ASB",
    source: `FFR (AS Bayonnaise) : Violet ; logo du club (page FFR)`,
  },
  "us-saint-palais": {
    colors: ["blanc", "bleu"],
    initials: "USSP",
    source: `FFR : Blanc, Bleu roi`,
  },
  "inthalatz-rugby-larressore": {
    colors: ["vert", "blanc"],
    initials: "IRL",
    source: `FFR : Vert, Blanc`,
  },
  "asso-cote-landes": {
    colors: ["bordeaux", "blanc"],
    initials: "ACLR",
    source: `FFR : Bordeaux ; logo du club (page FFR)`,
  },
  "ua-mimizan": {
    colors: ["noir", "blanc"],
    initials: "UAM",
    source: `${WIKI} ; FFR : Noir`,
  },
  "avenir-aturin": {
    colors: ["noir", "rouge"],
    initials: "AA",
    source: `${WIKI} : rouge et noir ; FFR : Noir, Rouge`,
  },
  "sa-hagetmau": {
    colors: ["rouge", "bleu"],
    initials: "SAH",
    source: `${WIKI} ; FFR (SA Hagetmautien) : Bleu roi, Rouge`,
  },
  "saint-paul-sr": {
    colors: ["bleu", "blanc"],
    initials: "SPSR",
    source: `${WIKI} ; FFR : Bleu`,
  },
  "aa-nogaro": {
    colors: ["orange", "noir"],
    initials: "AAN",
    source: `FFR : Tango ; logo du club (page FFR)`,
  },
  "capbreton-hossegor-rugby": {
    colors: ["jaune", "rouge", "bleu marine"],
    initials: "CHR",
    source: `FFR : Jaune, Or, Rouge, Bleu nuit ; logo du club (page FFR)`,
  },
  "sa-saint-sever": {
    colors: ["noir", "blanc"],
    initials: "SASS",
    source: `${WIKI} ; FFR (SA St Séverin) : Blanc, Noir`,
  },
  "ua-vicoise": {
    colors: ["noir", "orange"],
    initials: "UAV",
    source: `FFR : Tango ; logo du club (page FFR)`,
  },
  "rc-bassin-d-arcachon": {
    colors: ["noir", "bleu", "jaune"],
    initials: "RCBA",
    source: `${WIKI} ; FFR : Noir`,
  },
  "coquelicots-montechois-rugby": {
    colors: ["bleu", "rouge"],
    initials: "CMR",
    source: `FFR : Bleu, Rouge`,
  },
  "leognan-rugby": {
    colors: ["bleu ciel", "bleu marine"],
    initials: "LR",
    source: `FFR : Bleu ciel, Bleu nuit`,
  },
  "co-pont-du-casse": {
    colors: ["orange", "noir"],
    initials: "COP",
    source: `FFR : Orange ; logo du club (page FFR)`,
  },
  "us-nerac": {
    colors: ["jaune", "noir"],
    initials: "USN",
    source: `FFR (US Néracaise) : Jaune ; logo du club (page FFR)`,
  },
  "avenir-moissagais": {
    colors: ["bleu", "blanc"],
    initials: "AM",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "rc-bon-encontre-boe": {
    colors: ["bleu marine", "vert"],
    initials: "RCBE",
    source: `FFR : Marine, Vert`,
  },
  "rc-villeneuve": {
    colors: ["rouge", "noir"],
    initials: "RCV",
    source: `FFR : Rouge, Noir`,
  },
  "pessac-rugby": {
    colors: ["vert", "rouge"],
    initials: "PR",
    source: `FFR : Fraise ; logo du club (page FFR)`,
  },
  "rc-gradignan": {
    colors: ["vert", "blanc"],
    initials: "RCG",
    source: `FFR : Vert, Émeraude, Blanc`,
  },
  "us-vallee-du-lot": {
    colors: ["noir", "blanc"],
    initials: "USVL",
    source: `${WIKI} ; FFR : Noir`,
  },
  "us-juillac-objat": {
    colors: ["blanc", "bleu", "rouge"],
    initials: "USJO",
    source: `FFR : Blanc, Bleu roi, Rouge, Tomate`,
  },
  "rc-saint-cernin": oneColor("orange", "RCSC", `FFR : Orange`),
  "st-cere-rugby": {
    colors: ["rouge", "or"],
    initials: "SCR",
    source: `${WIKI} : sang et or ; FFR : Jaune, Rouge`,
  },
  "us-argentat": {
    colors: ["bleu marine", "blanc"],
    initials: "USA",
    source: `FFR (US Argentacoise) ; logo du club (page FFR)`,
  },
  "rc-bretenoux-biars-vayrac": {
    colors: ["bleu", "blanc"],
    initials: "RCBB",
    source: `FFR : Bleu, Blanc`,
  },
  "rc-buguois": {
    colors: ["bleu", "blanc"],
    initials: "RCB",
    source: `${WIKI} ; FFR : Blanc, Bleu`,
  },
  "us-lalinde": {
    colors: ["noir", "jaune"],
    initials: "USL",
    source: `FFR : Noir, Jaune`,
  },
  "rc-saint-flour": {
    colors: ["jaune", "bleu"],
    initials: "RCSF",
    source: `FFR : Jaune, Impérial, Bleu roi`,
  },
  "union-saint-astier-neuvic": {
    colors: ["blanc", "noir", "vert"],
    initials: "USAN",
    source: `FFR : Blanc, Noir, Vert`,
  },
  "rc-mussidan": {
    colors: ["rouge", "blanc"],
    initials: "RCM",
    source: `FFR (RC Mussidanais) : Rouge ; logo du club (page FFR)`,
  },
  "rc-orleans-la-source": {
    colors: ["blanc", "noir"],
    initials: "RCOS",
    source: `FFR : Blanc, Noir`,
  },
  "rc-gueret": {
    colors: ["vert", "noir"],
    initials: "RCGC",
    source: `FFR (RC Guérétois Creuse) : Vert, Noir`,
  },
  "ja-isle": {
    colors: ["blanc", "bleu", "bleu ciel"],
    initials: "JAI",
    source: `FFR : Blanc, Bleu, Bleu ciel`,
  },
  "oc-montlucon": {
    colors: ["noir", "blanc"],
    initials: "OCM",
    source: `${WIKI}`,
  },
  "rc-issoudun": {
    colors: ["jaune", "bleu"],
    initials: "RCI",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "asf-commentry": {
    colors: ["rouge", "blanc"],
    initials: "ASFC",
    source: `FFR (AS Forgeron Commentryens) : Rouge ; logo du club (page FFR)`,
  },
  "cr-ancizes-comps": {
    colors: ["noir", "orange"],
    initials: "CRAC",
    source: `FFR : Noir ; logo du club (page FFR)`,
  },
  "us-pithiviers": {
    colors: ["noir", "rouge"],
    initials: "USP",
    source: `FFR (US Pithivérienne) : Noir, Rouge`,
  },
  "clermont-uc-aubiere": {
    colors: ["blanc", "noir"],
    initials: "CUCA",
    source: `FFR : Blanc, Noir`,
  },
  "rugby-sancerrois": oneColor("noir", "RS", `FFR : Noir`),
  "niort-rc": {
    colors: ["rouge", "blanc"],
    initials: "NRC",
    source: `${WIKI} ; FFR : Blanc`,
  },
  "stade-poitevin": {
    colors: ["noir", "blanc"],
    initials: "SP",
    source: `${WIKI} ; FFR : Blanc, Noir`,
  },
  "sc-surgeres": {
    colors: ["rouge", "noir"],
    initials: "SCS",
    source: `FFR (SC Surgérien) : Rouge, Noir`,
  },
  "rc-puilboreau": {
    colors: ["bleu", "noir"],
    initials: "RCP",
    source: `FFR : Bleu roi ; logo du club (page FFR)`,
  },
  "sa-rochefort": {
    colors: ["rouge", "noir"],
    initials: "SAR",
    source: `${WIKI} ; FFR : Noir`,
  },
  "stade-blayais": {
    colors: ["bleu", "blanc"],
    initials: "SB",
    source: `FFR : Bleu nuit ; logo du club (page FFR)`,
  },
  "us-saintes": {
    colors: ["bleu", "blanc", "rouge"],
    initials: "USS",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "sa-parthenay": {
    colors: ["blanc", "rouge"],
    initials: "SAP",
    source: `FFR (SA Parthenaisien) : Blanc, Rouge`,
  },
  "sc-chinon": {
    colors: ["rouge", "or"],
    initials: "SCC",
    source: `FFR (SC Chinonais) : Sang, Jaune, Or`,
  },
  "stade-foyen": {
    colors: ["noir", "rouge"],
    initials: "SF",
    source: `FFR : Noir, Rouge`,
  },
  "plouzane-ac": {
    colors: ["blanc", "bleu ciel"],
    initials: "PAC",
    source: `FFR : Blanc, Bleu ciel`,
  },
  "pays-auray-rc": unknownColors("PARC"),
  "rc-quimper": {
    colors: ["bleu ciel", "noir", "blanc"],
    initials: "RCQ",
    source: `FFR (RC Quimperois) : Bleu ciel ; logo du club (page FFR)`,
  },
  "saint-nazaire-ovalie": {
    colors: ["rouge", "noir"],
    initials: "SNO",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
  "xv-de-l-erdre": oneColor("noir", "XVE", `FFR : Noir`),
  "rup-lorient": {
    colors: ["noir", "orange"],
    initials: "RUPL",
    source: `FFR (Rugby Union Pays de Lorient) ; logo du club (page FFR)`,
  },
  "sac-clisson-rugby": {
    colors: ["vert", "rouge"],
    initials: "SACC",
    source: `FFR : Vert ; logo du club (page FFR)`,
  },
  "rc-concarneau": {
    colors: ["noir", "blanc", "rouge"],
    initials: "RCC",
    source: `FFR (RC Concarnois) ; logo du club (page FFR)`,
  },
  "rc-saint-sebastien": {
    colors: ["blanc", "bleu", "vert"],
    initials: "RCSS",
    source: `FFR (RC St Sébastien Basse-Goulaine) : Blanc, Bleu, Vert`,
    toConfirm: "Page FFR à confirmer.",
  },
  "rc-trignac": oneColor("rouge", "RCT", `FFR (RC Trignacais) : Rouge`),
  "clamart-rugby-92": {
    colors: ["rouge", "blanc"],
    initials: "CR92",
    source: `${WIKI} : sang et neige ; FFR : Blanc, Rouge`,
  },
  "scorc-angers": {
    colors: ["noir", "blanc"],
    initials: "SCO",
    source: `FFR (SCO Rugby Angers) : Blanc, Noir ; logo du club (page FFR)`,
  },
  "us-olympiades-massif-central": {
    colors: ["bleu marine", "rouge"],
    initials: "USOM",
    source: `FFR : Bleu ; logo du club (page FFR)`,
  },
  "rcs-bretigny": {
    colors: ["rouge", "blanc"],
    initials: "RCSB",
    source: `FFR (Entente RC CS Brétigny) : Bleu roi ; logo du club (page FFR)`,
  },
  "ca-orsay-rc": {
    colors: ["noir", "orange"],
    initials: "CAO",
    source: `FFR : Noir, Orange`,
  },
  "roc-giffois": {
    colors: ["jaune", "noir"],
    initials: "ROC",
    source: `FFR : Jaune, Noir`,
  },
  "us-vendome": {
    colors: ["blanc", "bleu"],
    initials: "USV",
    source: `FFR (US Vendômoise) : Blanc, Bleu`,
  },
  "com-bagneux": {
    colors: ["noir", "rouge"],
    initials: "COMB",
    source: `FFR (CO Multisport Bagneux) : Rouge ; logo du club (page FFR)`,
  },
  "c-chartres-rugby": {
    colors: ["bleu", "bleu ciel"],
    initials: "CCR",
    source: `${WIKI} : bleu de Chartres ; FFR : Bleu ; logo du club (page FFR)`,
  },
  "rc-le-mans": {
    colors: ["rouge", "jaune"],
    initials: "RCM",
    source: `FFR : Rouge ; logo du club (page FFR)`,
  },
};
