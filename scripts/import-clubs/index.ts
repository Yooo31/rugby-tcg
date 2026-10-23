// Importe les clubs engagés cette saison, du Top 14 à la Fédérale 3.
//
// Sources, toutes deux ouvertes et interrogées par leur API officielle :
//   - Wikipédia en français (CC BY-SA 4.0) : composition des divisions, couleurs ;
//   - Wikidata (CC0) : commune et département de chaque club.
//
// Usage : pnpm clubs:import   (écrit src/data/catalog/clubs.wikipedia.json)
import { writeFile } from "node:fs/promises";
import { clubSchema, type Club, type DivisionId } from "../../src/domain";
import { fallbackColors, parseColors } from "./colors";
import { EXCLUDED_CLUBS, LOCATION_OVERRIDES } from "./overrides";
import {
  cityName,
  departmentOfInsee,
  formFromRecord,
  parseStandings,
  slugify,
} from "./parse";
import { SEASON, SEASON_PAGES } from "./sources";
import { fetchPlaces } from "./wikidata";
import {
  fetchInfoboxColors,
  fetchWikidataIds,
  fetchWikitext,
  resolveClubCodes,
} from "./wikipedia";

const OUTPUT = "src/data/catalog/clubs.wikipedia.json";

interface Entry {
  readonly division: DivisionId;
  readonly code: string;
  readonly form: ReturnType<typeof formFromRecord>;
}

async function main() {
  // 1. Clubs engagés, division par division.
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

  // 2. Article, élément Wikidata, commune et couleurs de chaque club.
  const links = await resolveClubCodes(entries.map(({ code }) => code));
  const titles = [...new Set([...links.values()].map(({ title }) => title))];
  const wikidataIds = await fetchWikidataIds(titles);
  const places = await fetchPlaces([...new Set(wikidataIds.values())]);
  const clubArticles = titles.filter((title) => {
    const id = wikidataIds.get(title);
    return id !== undefined && places.get(id)?.isCommune !== true;
  });
  const infoboxColors = await fetchInfoboxColors(clubArticles);

  // 3. Assemblage et validation.
  const clubs: (Club & { wikidata?: string })[] = [];
  const skipped: string[] = [];
  const usedIds = new Set<string>();
  let realColors = 0;

  for (const { division, code, form } of entries) {
    const link = links.get(code);
    if (!link) {
      skipped.push(`${code} : lien introuvable`);
      continue;
    }
    const wikidata = wikidataIds.get(link.title);
    const place = wikidata ? places.get(wikidata) : undefined;
    const location =
      LOCATION_OVERRIDES[code] ??
      (place && {
        city: cityName(place.city),
        department: departmentOfInsee(place.insee),
      });
    if (!location) {
      skipped.push(`${code} (${link.label}) : commune inconnue`);
      continue;
    }

    let id = slugify(link.label);
    if (usedIds.has(id)) id = `${id}-${location.department.toLowerCase()}`;
    usedIds.add(id);

    const colorText = infoboxColors.get(link.title);
    const colors = (colorText && parseColors(colorText)) || null;
    if (colors) realColors += 1;

    const parsed = clubSchema.safeParse({
      id,
      name: link.label,
      city: location.city,
      department: location.department,
      division,
      category: "senior-men",
      colors: colors ?? fallbackColors(id),
      recentResults: form,
    });
    if (!parsed.success) {
      skipped.push(
        `${code} (${link.label}) : ${parsed.error.issues[0].message}`,
      );
      continue;
    }
    // Un club qui partage l'élément Wikidata de sa commune n'a pas d'identifiant propre.
    clubs.push(place?.isCommune ? parsed.data : { ...parsed.data, wikidata });
  }

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

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
