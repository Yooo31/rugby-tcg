// Assemblage des clubs importés : pur (aucun appel réseau), donc testé.
// Les données viennent de Wikipédia et Wikidata (voir index.ts).
import { clubSchema, type Club, type DivisionId } from "../../src/domain";
import { fallbackColors, parseColors } from "./colors";
import { cityName, departmentOfInsee, slugify, type WikiLink } from "./parse";
import type { WikidataPlace } from "./wikidata";

export interface Entry {
  readonly division: DivisionId;
  /** Code court du club dans Wikipédia (« ru Pau »). */
  readonly code: string;
  readonly form: Club["recentResults"];
}

interface Location {
  readonly city: string;
  readonly department: string;
}

/** Tout ce que les sources ont appris sur les clubs, par code ou par titre. */
export interface Sources {
  readonly links: ReadonlyMap<string, WikiLink>;
  readonly wikidataIds: ReadonlyMap<string, string>;
  readonly places: ReadonlyMap<string, WikidataPlace>;
  readonly infoboxColors: ReadonlyMap<string, string>;
  /** Communes saisies à la main, prioritaires sur Wikidata. */
  readonly locationOverrides: Readonly<Record<string, Location>>;
}

export type ImportedClub = Club & { readonly wikidata?: string };

export interface Assembly {
  readonly clubs: readonly ImportedClub[];
  /** Clubs écartés, avec la raison, pour le compte rendu. */
  readonly skipped: readonly string[];
  /** Clubs dont l'infobox donnait les vraies couleurs. */
  readonly realColors: number;
}

/** Commune d'un club : saisie à la main, sinon celle de Wikidata. */
function locationOf(
  code: string,
  place: WikidataPlace | undefined,
  overrides: Sources["locationOverrides"],
): Location | undefined {
  if (overrides[code]) return overrides[code];
  if (!place) return undefined;
  return {
    city: cityName(place.city),
    department: departmentOfInsee(place.insee),
  };
}

/** Identifiant unique : deux clubs homonymes se distinguent par leur département. */
function uniqueId(
  label: string,
  department: string,
  used: Set<string>,
): string {
  const base = slugify(label);
  const id = used.has(base) ? `${base}-${department.toLowerCase()}` : base;
  used.add(id);
  return id;
}

type ClubResult =
  | { readonly club: ImportedClub; readonly hasRealColors: boolean }
  | { readonly skipped: string };

function assembleOne(
  { division, code, form }: Entry,
  sources: Sources,
  usedIds: Set<string>,
): ClubResult {
  const link = sources.links.get(code);
  if (!link) return { skipped: `${code} : lien introuvable` };

  const wikidata = sources.wikidataIds.get(link.title);
  const place = wikidata ? sources.places.get(wikidata) : undefined;
  const location = locationOf(code, place, sources.locationOverrides);
  if (!location)
    return { skipped: `${code} (${link.label}) : commune inconnue` };

  const id = uniqueId(link.label, location.department, usedIds);
  const colorText = sources.infoboxColors.get(link.title);
  const colors = (colorText && parseColors(colorText)) || null;

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
  if (!parsed.success)
    return {
      skipped: `${code} (${link.label}) : ${parsed.error.issues[0].message}`,
    };

  // Un club qui partage l'élément Wikidata de sa commune n'a pas d'identifiant propre.
  const club = place?.isCommune ? parsed.data : { ...parsed.data, wikidata };
  return { club, hasRealColors: colors !== null };
}

/** Assemble et valide les clubs engagés, dans l'ordre des divisions. */
export function assembleClubs(
  entries: readonly Entry[],
  sources: Sources,
): Assembly {
  const usedIds = new Set<string>();
  const clubs: ImportedClub[] = [];
  const skipped: string[] = [];
  let realColors = 0;
  for (const entry of entries) {
    const result = assembleOne(entry, sources, usedIds);
    if ("skipped" in result) {
      skipped.push(result.skipped);
      continue;
    }
    clubs.push(result.club);
    if (result.hasRealColors) realColors += 1;
  }
  return { clubs, skipped, realColors };
}
