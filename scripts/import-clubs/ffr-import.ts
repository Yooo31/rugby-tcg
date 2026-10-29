// Rapproche chaque club du catalogue de sa page officielle FFR (accord de la
// FFR, données des clubs seulement) et en garde le nom complet et les couleurs
// de la tenue. Usage : pnpm clubs:ffr (écrit scripts/import-clubs/clubs.ffr.json),
// qui sert à relire les fiches d'identité (src/data/catalog/identity).
//
// Les réponses sont en cache (.cache/import-clubs) et espacées de 3 secondes :
// relancer le script ne sollicite pas une seconde fois les serveurs de la FFR.
import { writeFile } from "node:fs/promises";
import { CLUB_CATALOG } from "../../src/data/catalog";
import {
  candidateSlugs,
  CLUB_PAGE_BASE,
  clubSlugsFromSitemap,
  LEAGUE_HOSTS,
  officialInitials,
  parseClubPage,
  pickClubPage,
  type ClubPageMatch,
  type FfrClubPage,
} from "./ffr";
import { ffrColors, type ClubColors } from "./colors";
import { getText } from "./http";

/** Aide à la revue des fiches d'identité : le catalogue ne le lit pas. */
const OUTPUT = "scripts/import-clubs/clubs.ffr.json";
/** Pages lues au plus par club : les identifiants les plus ressemblants. */
const MAX_CANDIDATES = 4;

/** Plans de site des clubs d'une ligue (index, puis un ou plusieurs fichiers). */
async function leagueSlugs(host: string): Promise<string[]> {
  const index = await getText(`https://${host}/sitemap.xml`, "application/xml");
  const sitemaps = [
    ...index.matchAll(/<loc>(https:\/\/[^<]*club-sitemap\d*\.xml)<\/loc>/g),
  ].map((match) => match[1] ?? "");
  const slugs: string[] = [];
  for (const sitemap of sitemaps)
    slugs.push(
      ...clubSlugsFromSitemap(await getText(sitemap, "application/xml")),
    );
  return slugs;
}

/** Ce que le catalogue retient d'un club rapproché. */
interface FfrClub {
  readonly slug: string;
  readonly name: string;
  /** Couleurs telles que la FFR les écrit, pour vérifier la traduction. */
  readonly colorNames: readonly string[];
  /** `null` si la FFR n'en donne pas ou si on ne sait pas les traduire. */
  readonly colors: ClubColors | null;
  readonly initials: string;
  /** Faux : rapprochement à vérifier à la main (nom ou sigle différents). */
  readonly isSure: boolean;
}

async function readPage(slug: string): Promise<FfrClubPage | null> {
  return parseClubPage(
    slug,
    await getText(`${CLUB_PAGE_BASE}${slug}`, "text/html"),
  );
}

async function main() {
  const slugs = new Set<string>();
  for (const host of LEAGUE_HOSTS) {
    const found = await leagueSlugs(host).catch((error: unknown) => {
      console.warn(`${host} : ${String(error)}`);
      return [];
    });
    console.log(`${host.padEnd(30)} ${found.length} clubs`);
    for (const slug of found) slugs.add(slug);
  }
  const allSlugs = [...slugs];

  const clubs: Record<string, FfrClub> = {};
  const unknownColors = new Set<string>();
  const unmatched: string[] = [];
  for (const [index, club] of CLUB_CATALOG.entries()) {
    const pages: FfrClubPage[] = [];
    let match: ClubPageMatch | null = null;
    // On lit les candidates une à une ; on s'arrête dès qu'un rapprochement
    // est sûr, sinon on garde le meilleur et on le signale.
    for (const slug of candidateSlugs(club, allSlugs, MAX_CANDIDATES)) {
      const page = await readPage(slug).catch(() => null);
      if (page) pages.push(page);
      match = pickClubPage(club, pages);
      if (match?.isSure) break;
    }
    if (match) {
      const { colors, unknown } = ffrColors(match.page.colors);
      for (const name of unknown) unknownColors.add(name);
      clubs[club.id] = {
        slug: match.page.slug,
        name: match.page.name,
        colorNames: match.page.colors,
        colors,
        initials: officialInitials(match.page.name),
        isSure: match.isSure,
      };
    } else
      unmatched.push(
        `${club.id} (${club.name}, ${club.city}, ${club.department})`,
      );
    console.log(
      `${String(index + 1).padStart(3)}/${CLUB_CATALOG.length} ${club.id} → ${match?.page.slug ?? "?"}${match && !match.isSure ? " (à vérifier)" : ""} ${match?.page.colors.join(", ") ?? ""}`,
    );
  }

  await writeFile(
    OUTPUT,
    `${JSON.stringify(
      {
        source:
          "FFR, pages publiques des clubs (monclubhouse.ffr.fr), avec accord",
        generatedAt: new Date().toISOString(),
        clubs,
        unmatched,
        unknownColors: [...unknownColors].sort(),
      },
      null,
      2,
    )}\n`,
  );
  console.log(
    `\n${Object.keys(clubs).length} clubs rapprochés, ${unmatched.length} à rapprocher à la main.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
