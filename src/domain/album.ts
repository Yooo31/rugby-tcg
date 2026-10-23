import {
  clubRegion,
  DIVISIONS,
  getDivision,
  type Club,
  type DivisionId,
} from "./club";
import {
  departmentName,
  regionName,
  type DepartmentCode,
  type RegionId,
} from "./geo";

/**
 * Règle d'appartenance d'un club à un album. Les albums ne stockent aucune
 * liste de clubs : une carte entre dans tous les albums dont elle satisfait
 * la règle, ce qui lui permet d'appartenir à plusieurs albums à la fois.
 */
export type AlbumRule =
  | { readonly type: "all" }
  | { readonly type: "division"; readonly division: DivisionId }
  | { readonly type: "region"; readonly region: RegionId }
  | { readonly type: "department"; readonly department: DepartmentCode };

/** Permanents aujourd'hui ; saisonniers et événementiels viendront s'ajouter ici. */
export type AlbumKind = "permanent";

export interface Album {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly kind: AlbumKind;
  readonly rule: AlbumRule;
}

export function clubMatchesRule(club: Club, rule: AlbumRule): boolean {
  switch (rule.type) {
    case "all":
      return true;
    case "division":
      return club.division === rule.division;
    case "region":
      return clubRegion(club) === rule.region;
    case "department":
      return club.department === rule.department;
  }
}

export function albumClubs(album: Album, clubs: readonly Club[]): Club[] {
  return clubs.filter((club) => clubMatchesRule(club, album.rule));
}

export interface AlbumProgress {
  readonly owned: number;
  readonly total: number;
  /** Entre 0 et 1. Vaut 0 pour un album vide. */
  readonly ratio: number;
  readonly isComplete: boolean;
}

export function albumProgress(
  album: Album,
  clubs: readonly Club[],
  ownedClubs: ReadonlySet<string>,
): AlbumProgress {
  const members = albumClubs(album, clubs);
  const owned = members.filter((club) => ownedClubs.has(club.id)).length;
  const total = members.length;
  return {
    owned,
    total,
    ratio: total === 0 ? 0 : owned / total,
    isComplete: total > 0 && owned === total,
  };
}

export const FRANCE_ALBUM_ID = "france";

/**
 * Albums permanents dérivés du jeu de clubs : la France, puis un album par
 * division, par région et par département où au moins un club existe.
 */
export function buildPermanentAlbums(clubs: readonly Club[]): Album[] {
  const usedDivisions = new Set(clubs.map((club) => club.division));
  const usedRegions = new Set(clubs.map(clubRegion));
  const usedDepartments = new Set(clubs.map((club) => club.department));

  const france: Album = {
    id: FRANCE_ALBUM_ID,
    title: "Tous les clubs de France",
    subtitle: "Le grand chelem",
    kind: "permanent",
    rule: { type: "all" },
  };

  const divisions = DIVISIONS.filter((division) =>
    usedDivisions.has(division.id),
  ).map((division): Album => ({
    id: `division-${division.id}`,
    title: getDivision(division.id).label,
    subtitle: "Division",
    kind: "permanent",
    rule: { type: "division", division: division.id },
  }));

  const regions = [...usedRegions]
    .sort(byLabel(regionName))
    .map((region): Album => ({
      id: `region-${region}`,
      title: regionName(region),
      subtitle: "Région",
      kind: "permanent",
      rule: { type: "region", region },
    }));

  const departments = [...usedDepartments]
    .sort(byLabel(departmentName))
    .map((department): Album => ({
      id: `departement-${department.toLowerCase()}`,
      title: departmentName(department),
      subtitle: `Département · ${department}`,
      kind: "permanent",
      rule: { type: "department", department },
    }));

  return [france, ...divisions, ...regions, ...departments];
}

function byLabel<T>(label: (value: T) => string) {
  return (a: T, b: T) => label(a).localeCompare(label(b), "fr");
}
