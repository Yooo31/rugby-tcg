import {
  computePower,
  getDivision,
  rarityRank,
  type Club,
  type Collection,
  type DivisionId,
  type OwnedCard,
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

export interface CollectionEntry {
  readonly card: OwnedCard;
  readonly club: Club;
}

type Comparator = (a: CollectionEntry, b: CollectionEntry) => number;

const byName: Comparator = (a, b) =>
  a.club.name.localeCompare(b.club.name, "fr");

const COMPARATORS: Record<SortId, Comparator> = {
  recent: (a, b) =>
    b.card.firstObtainedAt.localeCompare(a.card.firstObtainedAt),
  power: (a, b) => computePower(b.club) - computePower(a.club),
  rarity: (a, b) =>
    rarityRank(b.card.rarity) - rarityRank(a.card.rarity) ||
    getDivision(a.club.division).tier - getDivision(b.club.division).tier,
  name: byName,
};

/** Associe chaque carte à son club, filtre, puis trie (le nom départage les égalités). */
export function filterCollection(
  collection: Collection,
  clubsById: ReadonlyMap<string, Club>,
  { rarity, division, sort }: CollectionFilters,
): CollectionEntry[] {
  return collection
    .flatMap((card): CollectionEntry[] => {
      const club = clubsById.get(card.clubId);
      return club ? [{ card, club }] : [];
    })
    .filter(
      ({ card, club }) =>
        (!rarity || card.rarity === rarity) &&
        (!division || club.division === division),
    )
    .sort((a, b) => COMPARATORS[sort](a, b) || byName(a, b));
}
