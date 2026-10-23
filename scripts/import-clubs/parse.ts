/**
 * Fonctions pures de l'import des clubs : tout ce qui transforme du texte
 * Wikipédia ou Wikidata en données, sans aucun accès réseau.
 */

export interface StandingsRow {
  /** Code court du club dans les modèles Wikipédia, par exemple « ru Toulouse ». */
  readonly code: string;
  readonly wins: number;
  readonly draws: number;
  readonly losses: number;
}

/** Une ligne de classement : le modèle `Cls_Rugby` et ses paramètres, sur une ligne. */
const STANDINGS_ROW = /\{\{\s*Cls_Rugby\s*\|([^\n]*)/g;

/**
 * Valeur d'un paramètre nommé du modèle. On le cherche par son nom plutôt que
 * de découper la ligne : elle contient parfois d'autres modèles imbriqués.
 */
function param(line: string, name: string): string | undefined {
  return new RegExp(`(?:^|\\|)\\s*${name}\\s*=\\s*([^|}]*)`)
    .exec(line)?.[1]
    .trim();
}

const toCount = (value: string | undefined): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

/**
 * Clubs engagés d'après les tableaux de classement d'une page de saison.
 * Chaque club n'apparaît que dans une poule : un code répété est ignoré.
 */
export function parseStandings(wikitext: string): StandingsRow[] {
  const rows = new Map<string, StandingsRow>();
  for (const [, line] of wikitext.matchAll(STANDINGS_ROW)) {
    const code = param(line, "club");
    if (!code || rows.has(code)) continue;
    rows.set(code, {
      code,
      wins: toCount(param(line, "v")),
      draws: toCount(param(line, "n")),
      losses: toCount(param(line, "d")),
    });
  }
  return [...rows.values()];
}

export interface WikiLink {
  readonly title: string;
  readonly label: string;
}

/** Lit un lien interne « [[Titre|Libellé]] » ; le libellé vaut le titre s'il est absent. */
export function parseWikiLink(wikitext: string): WikiLink | null {
  const match = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(wikitext);
  if (!match) return null;
  const title = match[1].replaceAll("_", " ").trim();
  const label = (match[2] ?? match[1]).trim();
  // « Section paloise (rugby à XV) » : la précision entre parenthèses n'est pas le nom.
  return { title, label: label.replace(/\s*\([^)]*\)$/, "") };
}

/** Département d'une commune d'après son code INSEE (« 31555 » → « 31 », « 2B033 » → « 2B »). */
export function departmentOfInsee(insee: string): string {
  return insee.startsWith("97") ? insee.slice(0, 3) : insee.slice(0, 2);
}

/** « 16e arrondissement de Paris » → « Paris » : la carte affiche la ville, pas le quartier. */
export function cityName(place: string): string {
  return place.replace(/^\d+(?:er|e)\s+arrondissement\s+de\s+/i, "");
}

/** Identifiant stable d'un club à partir de son nom : minuscules, sans accent, tirets. */
export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Nombre de résultats affichés sur une carte. */
const FORM_LENGTH = 5;

type Result = "W" | "D" | "L";

/**
 * Forme affichée sur la carte, déduite du bilan de la saison.
 * Wikipédia donne des totaux, pas l'ordre des matchs : au-delà de cinq matchs,
 * on garde les proportions du bilan. L'ordre (victoires, nuls, défaites) est
 * donc conventionnel et non chronologique.
 */
export function formFromRecord(
  wins: number,
  draws: number,
  losses: number,
): Result[] {
  const record: [Result, number][] = [
    ["W", wins],
    ["D", draws],
    ["L", losses],
  ];
  const played = wins + draws + losses;
  if (played === 0) return [];

  const slots = Math.min(FORM_LENGTH, played);
  const shares = record.map(([result, count]) => {
    const exact = (count / played) * slots;
    return {
      result,
      kept: Math.floor(exact),
      remainder: exact - Math.floor(exact),
    };
  });
  // Répartition au plus fort reste pour arriver exactement à `slots`.
  let missing = slots - shares.reduce((total, share) => total + share.kept, 0);
  for (const share of [...shares].sort((a, b) => b.remainder - a.remainder)) {
    if (missing === 0) break;
    share.kept += 1;
    missing -= 1;
  }
  return shares.flatMap(({ result, kept }) => Array<Result>(kept).fill(result));
}
