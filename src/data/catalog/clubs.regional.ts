import type { DepartmentCode, DivisionId } from "@/domain";

/**
 * DIVISIONS RÉGIONALES — DONNÉES INDICATIVES.
 *
 * Wikipédia ne publie pas la composition des divisions régionales : ces clubs
 * existent, mais leur division n'est pas vérifiée et leurs couleurs sont
 * approximatives. Ils servent à faire vivre les albums « Régionale » en
 * attendant une source officielle (FFR ou ligues).
 *
 * Un club de cette liste est écarté automatiquement s'il figure déjà dans
 * l'import Wikipédia (voir `./index.ts`).
 *
 * Format : [id, nom, ville, département, couleur principale, couleur secondaire]
 */
export type ClubSeed = readonly [
  id: string,
  name: string,
  city: string,
  department: DepartmentCode,
  primary: string,
  secondary: string,
];

type RegionalDivision = Extract<DivisionId, `regionale${number}`>;

export const REGIONAL_CLUB_SEEDS: Record<
  RegionalDivision,
  readonly ClubSeed[]
> = {
  regionale1: [
    ["as-muret", "AS Muret", "Muret", "31", "#c8102e", "#111111"],
    ["grenade-sports", "Grenade Sports", "Grenade", "31", "#c8102e", "#f5f5f5"],
    ["leguevin", "Léguevin Rugby", "Léguevin", "31", "#0055a4", "#f5f5f5"],
    ["cahors-rugby", "Cahors Rugby", "Cahors", "46", "#0055a4", "#f5f5f5"],
    ["gourdon", "Gourdon XV Bouriane", "Gourdon", "46", "#c8102e", "#111111"],
    [
      "castelsarrasin",
      "CA Castelsarrasin",
      "Castelsarrasin",
      "82",
      "#0055a4",
      "#f5f5f5",
    ],
    ["rc-mende", "RC Mende Lozère", "Mende", "48", "#00843d", "#f5f5f5"],
    ["bedarieux", "RO Bédarieux", "Bédarieux", "34", "#c8102e", "#111111"],
    ["bastia-xv", "Bastia XV", "Bastia", "2B", "#0055a4", "#f5f5f5"],
    ["us-tours", "US Tours", "Tours", "37", "#0b2a5b", "#6cace4"],
  ],
  regionale2: [
    ["lunion", "Rugby Club L'Union", "L'Union", "31", "#0055a4", "#c8102e"],
    ["fonsorbes", "Fonsorbes Rugby", "Fonsorbes", "31", "#00843d", "#f5f5f5"],
    ["carbonne", "US Carbonne", "Carbonne", "31", "#c8102e", "#111111"],
    ["rieumes", "SC Rieumes", "Rieumes", "31", "#111111", "#f5f5f5"],
    ["saverdun", "UA Saverdun", "Saverdun", "09", "#c8102e", "#f5f5f5"],
    [
      "vic-fezensac",
      "US Vic-Fezensac",
      "Vic-Fezensac",
      "32",
      "#c8102e",
      "#111111",
    ],
    ["caussade", "US Caussade", "Caussade", "82", "#0055a4", "#ffd100"],
    ["uzes", "RC Uzès", "Uzès", "30", "#c8102e", "#f5f5f5"],
    ["ajaccio", "RC Ajaccio", "Ajaccio", "2A", "#c8102e", "#f5f5f5"],
    [
      "besancon",
      "Olympique de Besançon",
      "Besançon",
      "25",
      "#0055a4",
      "#f5f5f5",
    ],
  ],
  regionale3: [
    [
      "aucamville",
      "Aucamville Rugby",
      "Aucamville",
      "31",
      "#c8102e",
      "#f5f5f5",
    ],
    ["cugnaux", "Cugnaux Rugby", "Cugnaux", "31", "#0055a4", "#f5f5f5"],
    [
      "montastruc",
      "Montastruc Rugby",
      "Montastruc-la-Conseillère",
      "31",
      "#00843d",
      "#ffd100",
    ],
    ["bessieres", "US Bessières", "Bessières", "31", "#c8102e", "#111111"],
    ["launaguet", "Launaguet Rugby", "Launaguet", "31", "#6a1b9a", "#f5f5f5"],
    [
      "saint-lys",
      "Saint-Lys Olympique",
      "Saint-Lys",
      "31",
      "#0055a4",
      "#ffd100",
    ],
    ["lezat", "Lézat Rugby", "Lézat-sur-Lèze", "09", "#c8102e", "#f5f5f5"],
    ["verfeil", "Verfeil Rugby", "Verfeil", "31", "#111111", "#f2c14e"],
    ["cazeres", "US Cazères", "Cazères", "31", "#c8102e", "#0033a0"],
    [
      "le-fousseret",
      "Le Fousseret Rugby",
      "Le Fousseret",
      "31",
      "#ff6a13",
      "#111111",
    ],
  ],
};
