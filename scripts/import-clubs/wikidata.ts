import { chunk, getJson } from "./http";

const ENDPOINT = "https://query.wikidata.org/sparql";
const ITEMS_PER_QUERY = 120;

export interface WikidataPlace {
  readonly city: string;
  /** Code INSEE de la commune. */
  readonly insee: string;
  /** Vrai si l'élément est la commune elle-même : le club n'a pas d'article à lui. */
  readonly isCommune: boolean;
}

interface Binding {
  readonly [name: string]: { readonly value: string } | undefined;
}

/**
 * Commune de chaque élément Wikidata. Par ordre de confiance : la commune
 * elle-même (quand le lien du club pointe vers sa ville), le siège du club,
 * puis sa localisation administrative.
 */
export async function fetchPlaces(
  ids: readonly string[],
): Promise<Map<string, WikidataPlace>> {
  const places = new Map<string, WikidataPlace>();
  for (const batch of chunk(ids, ITEMS_PER_QUERY)) {
    const query = `SELECT ?item ?itemLabel ?own ?seatLabel ?seatInsee ?areaLabel ?areaInsee WHERE {
      VALUES ?item { ${batch.map((id) => `wd:${id}`).join(" ")} }
      OPTIONAL { ?item wdt:P374 ?own }
      OPTIONAL { ?item wdt:P159 ?seat . OPTIONAL { ?seat wdt:P374 ?seatInsee } }
      OPTIONAL { ?item wdt:P131 ?area . OPTIONAL { ?area wdt:P374 ?areaInsee } }
      SERVICE wikibase:label { bd:serviceParam wikibase:language "fr". }
    }`;
    const data = await getJson<{ results: { bindings: Binding[] } }>(
      `${ENDPOINT}?${new URLSearchParams({ query })}`,
      "application/sparql-results+json",
    );

    for (const row of data.results.bindings) {
      const id = row.item?.value.split("/").pop();
      if (!id || places.has(id)) continue;
      const candidates = [
        { city: row.itemLabel?.value, insee: row.own?.value, isCommune: true },
        {
          city: row.seatLabel?.value,
          insee: row.seatInsee?.value,
          isCommune: false,
        },
        {
          city: row.areaLabel?.value,
          insee: row.areaInsee?.value,
          isCommune: false,
        },
      ];
      const best = candidates.find(({ city, insee }) => city && insee);
      if (best?.city && best.insee) {
        places.set(id, {
          city: best.city,
          insee: best.insee,
          isCommune: best.isCommune,
        });
      }
    }
  }
  return places;
}
