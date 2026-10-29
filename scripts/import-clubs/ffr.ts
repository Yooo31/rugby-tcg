// Données officielles des clubs, avec l'accord de la FFR (pas les résultats) :
//   - liste des clubs : plan du site de chaque ligue (`club-sitemap.xml`) ;
//   - nom complet, couleurs de la tenue, adresse : page publique du club sur
//     monclubhouse.ffr.fr (le robots.txt l'autorise).
// Jamais les logos : ils appartiennent aux clubs.
//
// Lecture pure ici (testée) ; les requêtes passent par `http.ts` (cache, pause).
import { slugify } from "./parse";

/** Sites des ligues régionales, qui publient chacune la liste de leurs clubs. */
export const LEAGUE_HOSTS = [
  "ligueaura.ffr.fr",
  "liguebgfc.ffr.fr",
  "liguebretagne.ffr.fr",
  "liguecorse.ffr.fr",
  "liguecentrevaldeloire.ffr.fr",
  "liguegrandest.ffr.fr",
  "liguehautsdefrance.ffr.fr",
  "ligueidf.ffr.fr",
  "liguenormandie.ffr.fr",
  "liguenouvelleaquitaine.ffr.fr",
  "ligueoccitanie.ffr.fr",
  "liguepaysdeloire.ffr.fr",
  "liguesudpaca.ffr.fr",
] as const;

export const CLUB_PAGE_BASE = "https://monclubhouse.ffr.fr/clubs/";

/** Identifiants des clubs (`/clubs/<identifiant>`) listés dans un plan de site. */
export function clubSlugsFromSitemap(xml: string): string[] {
  const slugs = [...xml.matchAll(/<loc>[^<]*\/clubs\/([a-z0-9-]+)\/?<\/loc>/g)]
    .map((match) => match[1])
    .filter((slug): slug is string => Boolean(slug));
  return [...new Set(slugs)];
}

export interface FfrClubPage {
  readonly slug: string;
  /** Nom officiel complet (« Racing Club Salvetat Plaisance »). */
  readonly name: string;
  /** Couleurs de la tenue, en toutes lettres, dans l'ordre de la FFR. */
  readonly colors: readonly string[];
  readonly postalCode: string | null;
  readonly city: string | null;
}

/** Le contenu de la page est servi dans un flux où les guillemets sont échappés. */
const unescape = (html: string) => html.replaceAll('\\"', '"');

/**
 * Lit la page publique d'un club. Renvoie `null` pour une page vide (club
 * inconnu) : le site répond alors 200 avec une coquille sans données.
 */
export function parseClubPage(slug: string, html: string): FfrClubPage | null {
  const page = unescape(html);
  const name = /"headerData":\{[^}]*"nom":"([^"]+)"/.exec(page)?.[1];
  if (!name) return null;

  // La pastille des couleurs est suivie de leur nom, juste avant les contacts.
  const colorText =
    /"backgroundColor":"[^"]+"[^[]*?\}\]\}\]\],\["\$","p",null,\{"className":"[^"]*","children":"([^"]+)"\}/.exec(
      page,
    )?.[1];
  const colors = colorText
    ? colorText
        .split(/\s*(?:,|\bet\b|\/|-)\s*/i)
        .map((color) => color.trim())
        .filter((color) => color.length > 0)
    : [];

  const address = /"id":"address","title":"[^"]*?\b(\d{5})\s+([^"]+)"/.exec(
    page,
  );
  return {
    slug,
    name: decodeEntities(name),
    colors,
    postalCode: address?.[1] ?? null,
    city: address?.[2] ? decodeEntities(address[2]) : null,
  };
}

function decodeEntities(text: string): string {
  return text
    .replaceAll("\\u0026", "&")
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'")
    .replaceAll("&#39;", "'");
}

/** Département d'un code postal : 2A et 2B pour la Corse, 971 à 976 outre-mer. */
export function departmentOfPostalCode(postalCode: string): string {
  if (postalCode.startsWith("97")) return postalCode.slice(0, 3);
  if (postalCode.startsWith("20"))
    return Number(postalCode) < 20200 ? "2A" : "2B";
  return postalCode.slice(0, 2);
}

/** Mots qui ne distinguent pas un club d'un autre. */
const STOP_WORDS = new Set([
  "rugby",
  "club",
  "de",
  "du",
  "des",
  "la",
  "le",
  "les",
  "et",
  "en",
  "xv",
  "l",
  "d",
]);

/**
 * Abréviations de forme juridique : « RC » vaut aussi bien Racing Club que
 * Rugby Club, on ne s'en sert donc pas pour comparer.
 */
const ABBREVIATIONS = new Set([
  "uso",
  "usa",
  "asm",
  "cab",
  "rct",
  "sua",
  "aso",
]);
/** Sigles de deux lettres (RC, US, AS, SC…) : trop ambigus pour comparer. */
const MAX_AMBIGUOUS_LENGTH = 2;

/** Mots significatifs d'un nom ou d'un identifiant, sans accents. */
export function nameTokens(text: string): Set<string> {
  return new Set(
    slugify(text)
      .split("-")
      .filter(
        (token) =>
          token.length > MAX_AMBIGUOUS_LENGTH &&
          !STOP_WORDS.has(token) &&
          !ABBREVIATIONS.has(token),
      ),
  );
}

/**
 * Ressemblance entre deux noms : part des mots du plus court présents dans
 * l'autre (0 à 1). « RC Salvetat Plaisance » et « racing-club-salvetat-
 * plaisance » partagent « salvetat » et « plaisance ».
 */
export function nameSimilarity(a: string, b: string): number {
  const left = nameTokens(a);
  const right = nameTokens(b);
  if (left.size === 0 || right.size === 0) return 0;
  const [small, large] =
    left.size <= right.size ? [left, right] : [right, left];
  let shared = 0;
  for (const token of small) if (large.has(token)) shared += 1;
  return shared / small.size;
}

/** Sigle en tête du nom d'un club (« ASM Clermont » → « asm »), sinon `null`. */
export function leadingAbbreviation(name: string): string | null {
  const first = name.trim().split(/\s+/)[0] ?? "";
  return /^[A-Z]{2,4}$/.test(first) ? first.toLowerCase() : null;
}

/** Le sigle du club est-il celui de l'identifiant ou du nom officiel FFR ? */
function abbreviationAgrees(abbreviation: string, slugOrName: string): boolean {
  const slug = slugify(slugOrName);
  if (slug.startsWith(`${abbreviation}-`)) return true;
  const initials = slug
    .split("-")
    .filter((word) => !MINOR_SLUG_WORDS.has(word))
    .map((word) => word[0])
    .join("");
  return initials.startsWith(abbreviation);
}

const MINOR_SLUG_WORDS = new Set([
  "de",
  "du",
  "des",
  "la",
  "le",
  "les",
  "l",
  "d",
  "et",
  "en",
  "sur",
]);

/** Poids du nom face à la commune pour classer les identifiants candidats. */
const NAME_WEIGHT = 2;
/** Bonus quand le sigle du club concorde (ASM ↔ Association Sportive Montferrandaise). */
const ABBREVIATION_BONUS = 1.5;

/** Identifiants FFR les plus ressemblants à un club (nom, sigle, commune), du meilleur au moins bon. */
export function candidateSlugs(
  club: { readonly name: string; readonly city: string },
  slugs: readonly string[],
  limit: number,
): string[] {
  const abbreviation = leadingAbbreviation(club.name);
  return slugs
    .map((slug) => {
      const similarity = nameSimilarity(club.name, slug);
      // Le sigle ne départage que des noms qui se ressemblent déjà.
      const bonus =
        similarity > 0 &&
        abbreviation !== null &&
        abbreviationAgrees(abbreviation, slug)
          ? ABBREVIATION_BONUS
          : 0;
      return {
        slug,
        score:
          similarity * NAME_WEIGHT + nameSimilarity(club.city, slug) + bonus,
      };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.slug.localeCompare(b.slug))
    .slice(0, limit)
    .map(({ slug }) => slug);
}

/** Similarité minimale pour accepter une page dont le département concorde. */
export const MIN_MATCH_SIMILARITY = 0.5;

export interface ClubPageMatch {
  readonly page: FfrClubPage;
  /**
   * Nom identique (mots significatifs) et sigle concordant : rien à revoir.
   * Sinon, le rapprochement est à vérifier à la main.
   */
  readonly isSure: boolean;
}

/**
 * Page FFR d'un club, parmi les candidates lues : même département, nom
 * suffisamment proche, sigle concordant de préférence. Sinon `null` (club à
 * rapprocher à la main).
 */
export function pickClubPage(
  club: {
    readonly name: string;
    readonly city: string;
    readonly department: string;
  },
  pages: readonly FfrClubPage[],
): ClubPageMatch | null {
  const abbreviation = leadingAbbreviation(club.name);
  const scored = pages
    .filter(
      (page) =>
        page.postalCode !== null &&
        departmentOfPostalCode(page.postalCode) === club.department,
    )
    .map((page) => {
      const similarity = Math.max(
        nameSimilarity(club.name, page.name),
        nameSimilarity(`${club.name} ${club.city}`, page.name),
      );
      const agrees =
        abbreviation === null ||
        abbreviationAgrees(abbreviation, page.name) ||
        abbreviationAgrees(abbreviation, page.slug);
      return { page, similarity, agrees, score: similarity + (agrees ? 1 : 0) };
    })
    .filter(({ similarity }) => similarity >= MIN_MATCH_SIMILARITY)
    .sort((a, b) => b.score - a.score);
  const best = scored[0];
  if (!best) return null;
  return { page: best.page, isSure: best.similarity === 1 && best.agrees };
}

/** Mots qui ne comptent pas dans un sigle (articles, liaisons). */
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
  "a",
]);
/** Mots ignorés dans un sigle, sauf en tête du nom (« Rugby Club Toulonnais »). */
const SPORT_WORDS = new Set(["rugby", "xv", "15"]);
/** Longueur maximale d'un sigle (même limite que le blason). */
const MAX_SIGLE_LENGTH = 4;

/**
 * Sigle tiré du nom officiel : « Racing Club Salvetat Plaisance » donne
 * « RCSP », « Football Club de Grenoble Rugby » donne « FCG ». Un sigle déjà
 * écrit dans le nom (« USA ») est repris tel quel.
 */
export function officialInitials(name: string): string {
  const words = name
    .split(/[\s'’-]+/)
    .filter((word) => word.length > 0 && !MINOR_WORDS.has(word.toLowerCase()))
    .filter(
      (word, index) => index === 0 || !SPORT_WORDS.has(word.toLowerCase()),
    );
  return words
    .map((word) =>
      /^[A-Z0-9]{2,}$/.test(word) ? word : (word[0]?.toUpperCase() ?? ""),
    )
    .join("")
    .normalize("NFD")
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, MAX_SIGLE_LENGTH);
}
