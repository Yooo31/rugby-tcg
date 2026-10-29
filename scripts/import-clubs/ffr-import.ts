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
  findClubPage,
  CLUB_PAGE_BASE,
  clubSlugsFromSitemap,
  LEAGUE_HOSTS,
  ffrClubEntry,
  parseClubPage,
  type FfrClub,
  type FfrClubPage,
} from "./ffr";
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

/** Page d'un club ; `null` si elle est vide ou injoignable. */
async function readPage(slug: string): Promise<FfrClubPage | null> {
  const html = await getText(`${CLUB_PAGE_BASE}${slug}`, "text/html").catch(
    (error: unknown) => {
      // Échec passager (réseau, 5xx) : non mis en cache, à relancer.
      console.warn(`${slug} : ${String(error)}`);
      return "";
    },
  );
  return parseClubPage(slug, html);
}

/** Identifiants de tous les clubs listés par les ligues. */
async function allLeagueSlugs(): Promise<string[]> {
  const slugs = new Set<string>();
  for (const host of LEAGUE_HOSTS) {
    const found = await leagueSlugs(host).catch((error: unknown) => {
      console.warn(`${host} : ${String(error)}`);
      return [];
    });
    console.log(`${host.padEnd(30)} ${found.length} clubs`);
    for (const slug of found) slugs.add(slug);
  }
  return [...slugs];
}

async function main() {
  const slugs = await allLeagueSlugs();
  const clubs: Record<string, FfrClub> = {};
  const unmatched: string[] = [];
  for (const [index, club] of CLUB_CATALOG.entries()) {
    const match = await findClubPage(club, slugs, MAX_CANDIDATES, readPage);
    if (match) clubs[club.id] = ffrClubEntry(match);
    else
      unmatched.push(
        `${club.id} (${club.name}, ${club.city}, ${club.department})`,
      );
    console.log(
      `${index + 1}/${CLUB_CATALOG.length} ${club.id} → ${match?.page.slug ?? "?"}`,
    );
  }
  const unknownColors = [
    ...new Set(
      Object.values(clubs).flatMap(({ unknownColors }) => unknownColors),
    ),
  ].sort();
  const document = {
    source: "FFR, pages publiques des clubs (monclubhouse.ffr.fr), avec accord",
    generatedAt: new Date().toISOString(),
    clubs,
    unmatched,
    unknownColors,
  };
  await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`);
  console.log(
    `\n${Object.keys(clubs).length} clubs rapprochés, ${unmatched.length} à rapprocher à la main.`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
