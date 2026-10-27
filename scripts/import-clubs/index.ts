// Importe les clubs engagés cette saison, du Top 14 à la Fédérale 3.
//
// Sources, toutes deux ouvertes et interrogées par leur API officielle :
//   - Wikipédia en français (CC BY-SA 4.0) : composition des divisions, couleurs ;
//   - Wikidata (CC0) : commune et département de chaque club.
//
// Usage : pnpm clubs:import   (écrit src/data/catalog/clubs.wikipedia.json)
import { writeFile } from "node:fs/promises";
import type { DivisionId } from "../../src/domain";
import {
  assembleClubs,
  type Assembly,
  type Entry,
  type Sources,
} from "./assemble";
import { EXCLUDED_CLUBS, LOCATION_OVERRIDES } from "./overrides";
import { formFromRecord, parseStandings } from "./parse";
import { SEASON, SEASON_PAGES } from "./sources";
import { fetchPlaces } from "./wikidata";
import {
  fetchInfoboxColors,
  fetchWikidataIds,
  fetchWikitext,
  resolveClubCodes,
} from "./wikipedia";

const OUTPUT = "src/data/catalog/clubs.wikipedia.json";

/** 1. Clubs engagés, division par division. */
async function collectEntries(): Promise<Entry[]> {
  const entries: Entry[] = [];
  for (const [division, page] of Object.entries(SEASON_PAGES) as [
    DivisionId,
    string,
  ][]) {
    const rows = parseStandings(await fetchWikitext(page));
    console.log(`${division.padEnd(11)} ${rows.length} clubs`);
    for (const { code, wins, draws, losses } of rows) {
      if (code in EXCLUDED_CLUBS) continue;
      entries.push({
        division,
        code,
        form: formFromRecord(wins, draws, losses),
      });
    }
  }
  return entries;
}

/** 2. Article, élément Wikidata, commune et couleurs de chaque club. */
async function fetchSources(entries: readonly Entry[]): Promise<Sources> {
  const links = await resolveClubCodes(entries.map(({ code }) => code));
  const titles = [...new Set([...links.values()].map(({ title }) => title))];
  const wikidataIds = await fetchWikidataIds(titles);
  const places = await fetchPlaces([...new Set(wikidataIds.values())]);
  // Un lien vers la commune elle-même n'a pas d'infobox de club.
  const clubArticles = titles.filter((title) => {
    const id = wikidataIds.get(title);
    return id !== undefined && places.get(id)?.isCommune !== true;
  });
  const infoboxColors = await fetchInfoboxColors(clubArticles);
  return {
    links,
    wikidataIds,
    places,
    infoboxColors,
    locationOverrides: LOCATION_OVERRIDES,
  };
}

/** 4. Écrit le catalogue et rend compte de ce qui a été écarté. */
async function writeCatalog({ clubs, skipped, realColors }: Assembly) {
  const document = {
    season: SEASON,
    source: "Wikipédia en français (CC BY-SA 4.0) et Wikidata (CC0)",
    generatedAt: new Date().toISOString().slice(0, 10),
    clubs,
  };
  await writeFile(OUTPUT, `${JSON.stringify(document, null, 2)}\n`);

  console.log(`\n${clubs.length} clubs écrits dans ${OUTPUT}`);
  console.log(
    `${realColors} avec leurs couleurs réelles, ${clubs.length - realColors} avec des couleurs attribuées`,
  );
  for (const [code, reason] of Object.entries(EXCLUDED_CLUBS))
    console.log(`écarté : ${code} (${reason})`);
  if (skipped.length > 0) {
    console.log(`\n${skipped.length} clubs ignorés :`);
    for (const line of skipped) console.log(`  ${line}`);
    process.exitCode = 1;
  }
}

async function main() {
  const entries = await collectEntries();
  const sources = await fetchSources(entries);
  // 3. Assemblage et validation (pur, testé dans assemble.test.ts).
  await writeCatalog(assembleClubs(entries, sources));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
