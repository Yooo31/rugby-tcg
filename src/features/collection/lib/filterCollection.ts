import {
  computePower,
  getDivision,
  holdingsByClub,
  rarityRank,
  type Club,
  type ClubHoldings,
  type Collection,
  type DivisionId,
  type Rarity,
} from "@/domain";

export const SORT_OPTIONS = [
  { id: "recent", label: "Récentes" },
  { id: "power", label: "Puissance" },
  { id: "rarity", label: "Rareté" },
  { id: "name", label: "Nom" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];

export interface CollectionFilters {
  readonly rarity: Rarity | null;
  readonly division: DivisionId | null;
  readonly sort: SortId;
}

/** Un club de la collection, montré dans une seule de ses raretés. */
export interface CollectionEntry {
  readonly club: Club;
  readonly holdings: ClubHoldings;
  /** Rareté montrée : la rareté filtrée, sinon la meilleure obtenue. */
  readonly rarity: Rarity;
  /** Exemplaires de la rareté filtrée, sinon de toutes les raretés du club. */
  readonly count: number;
}

type Comparator = (a: CollectionEntry, b: CollectionEntry) => number;

const byName: Comparator = (a, b) =>
  a.club.name.localeCompare(b.club.name, "fr");

const COMPARATORS: Record<SortId, Comparator> = {
  recent: (a, b) =>
    b.holdings.lastUnlockedAt.localeCompare(a.holdings.lastUnlockedAt),
  power: (a, b) => computePower(b.club) - computePower(a.club),
  rarity: (a, b) =>
    rarityRank(b.rarity) - rarityRank(a.rarity) ||
    getDivision(a.club.division).tier - getDivision(b.club.division).tier,
  name: byName,
};

/**
 * Une entrée par club possédé (à sa meilleure rareté, ou dans la rareté
 * filtrée), filtrée puis triée ; le nom départage les égalités.
 */
export function filterCollection(
  collection: Collection,
  clubsById: ReadonlyMap<string, Club>,
  { rarity, division, sort }: CollectionFilters,
): CollectionEntry[] {
  return [...holdingsByClub(collection).values()]
    .flatMap((holdings): CollectionEntry[] => {
      const club = clubsById.get(holdings.clubId);
      if (!club || (division && club.division !== division)) return [];
      if (!rarity)
        return [
          {
            club,
            holdings,
            rarity: holdings.bestRarity,
            count: holdings.total,
          },
        ];
      const count = holdings.copies[rarity];
      return count ? [{ club, holdings, rarity, count }] : [];
    })
    .sort((a, b) => COMPARATORS[sort](a, b) || byName(a, b));
}
