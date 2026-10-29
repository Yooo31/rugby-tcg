import { z } from "zod";
import { departmentCodeSchema, regionOfDepartment, type RegionId } from "./geo";
import { crestStyleSchema } from "./crest";

/**
 * Divisions seniors, de l'élite (tier 1) au premier échelon régional (tier 10).
 * L'ordre du tableau est l'ordre hiérarchique et l'ordre d'affichage.
 */
export const DIVISIONS = [
  { id: "top14", label: "Top 14", short: "T14", tier: 1 },
  { id: "prod2", label: "Pro D2", short: "PD2", tier: 2 },
  { id: "nationale", label: "Nationale", short: "NAT", tier: 3 },
  { id: "nationale2", label: "Nationale 2", short: "N2", tier: 4 },
  { id: "federale1", label: "Fédérale 1", short: "F1", tier: 5 },
  { id: "federale2", label: "Fédérale 2", short: "F2", tier: 6 },
  { id: "federale3", label: "Fédérale 3", short: "F3", tier: 7 },
  { id: "regionale1", label: "Régionale 1", short: "R1", tier: 8 },
  { id: "regionale2", label: "Régionale 2", short: "R2", tier: 9 },
  { id: "regionale3", label: "Régionale 3", short: "R3", tier: 10 },
] as const;

export type Division = (typeof DIVISIONS)[number];
export type DivisionId = Division["id"];

const divisionIds = DIVISIONS.map((division) => division.id) as [
  DivisionId,
  ...DivisionId[],
];
const divisionIdSchema = z.enum(divisionIds);

const divisionsById = new Map<DivisionId, Division>(
  DIVISIONS.map((division) => [division.id, division]),
);

/**
 * Divisions présentes dans le modèle mais retirées du jeu pour l'instant :
 * les régionales sont saisies à la main, faute de source officielle
 * (issue #18). Les réactiver revient à vider cette liste.
 */
export const HIDDEN_DIVISIONS: readonly DivisionId[] = [
  "regionale1",
  "regionale2",
  "regionale3",
];

/** Divisions jouables, dans l'ordre hiérarchique. */
export const PLAYABLE_DIVISIONS: readonly Division[] = DIVISIONS.filter(
  (division) => !HIDDEN_DIVISIONS.includes(division.id),
);

export function isPlayableDivision(id: DivisionId): boolean {
  return !HIDDEN_DIVISIONS.includes(id);
}

export function getDivision(id: DivisionId): Division {
  // La Map est construite depuis DIVISIONS : tout DivisionId y figure.
  return divisionsById.get(id) as Division;
}

/**
 * Catégorie d'équipe. Seuls les seniors masculins existent pour l'instant ;
 * féminines et jeunes s'ajouteront ici sans toucher au reste du modèle.
 */
const categorySchema = z.enum(["senior-men"]);

export const matchResultSchema = z.enum(["W", "D", "L"]);
export type MatchResult = z.infer<typeof matchResultSchema>;

/** Nombre de résultats récents pris en compte (forme du moment). */
export const RECENT_RESULTS_WINDOW = 5;

/**
 * Forme récente affichée et comptée dans la puissance. Coupée tant qu'aucune
 * source officielle ne fournit les résultats (accord FFR ou ligues) : ceux du
 * catalogue ne sont pas tenus à jour, et des défaites inexactes froisseraient
 * clubs et joueurs. Remettre à `true` quand les résultats seront fiables.
 */
export const IS_RECENT_FORM_SHOWN = false;

const hexColorSchema = z
  .string()
  .regex(/^#[0-9a-f]{6}$/i, "Couleur hexadécimale attendue");

export const clubSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  city: z.string().min(1),
  department: departmentCodeSchema,
  division: divisionIdSchema,
  category: categorySchema,
  colors: z.object({
    primary: hexColorSchema,
    secondary: hexColorSchema,
    /** Troisième couleur d'un club tricolore (liseré du blason). */
    tertiary: hexColorSchema.optional(),
  }),
  /**
   * Sigle officiel du club (« RCSP »), sinon tiré de son nom. Jusqu'à
   * quatre lettres ou chiffres.
   */
  initials: z
    .string()
    .regex(/^[A-Z0-9]{1,4}$/)
    .optional(),
  /** Du plus ancien au plus récent. */
  recentResults: z.array(matchResultSchema).max(RECENT_RESULTS_WINDOW),
  /** Blason choisi pour ce club (catalogue) ; sinon tiré de son identifiant. */
  crest: crestStyleSchema.optional(),
});

export type Club = z.infer<typeof clubSchema>;

export function clubRegion(club: Club): RegionId {
  return regionOfDepartment(club.department);
}

/** Longueur maximale d'un sigle sur le blason. */
export const MAX_INITIALS = 4;
const MINOR_WORDS = new Set([
  "de",
  "du",
  "des",
  "la",
  "le",
  "les",
  "l",
  "d",
  "en",
  "sur",
  "et",
]);
const ACRONYM = /^[A-Z]{2,}$/;

/**
 * Initiales tirées du nom, quand le club n'a pas de sigle officiel
 * (4 lettres au plus).
 * Un sigle est repris tel quel : « RC Toulonnais » donne « RCT ».
 */
export function clubInitials(name: string): string {
  return name
    .split(/[\s'’-]+/)
    .filter((word) => word.length > 0 && !MINOR_WORDS.has(word.toLowerCase()))
    .map((word) => (ACRONYM.test(word) ? word : word[0].toUpperCase()))
    .join("")
    .slice(0, MAX_INITIALS);
}
