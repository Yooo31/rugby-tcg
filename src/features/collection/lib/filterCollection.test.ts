import type { Collection } from "@/domain";
import { makeClub } from "@/test/fixtures";
import { filterCollection } from "./filterCollection";

const clubs = [
  makeClub({ id: "toulouse", name: "Stade Toulousain", division: "top14" }),
  makeClub({ id: "cugnaux", name: "Cugnaux Rugby", division: "regionale3" }),
  makeClub({ id: "albi", name: "SC Albi", division: "nationale" }),
];
const clubsById = new Map(clubs.map((club) => [club.id, club]));

const collection: Collection = [
  {
    clubId: "toulouse",
    rarity: "common",
    count: 2,
    firstObtainedAt: "2026-10-01",
  },
  {
    clubId: "cugnaux",
    rarity: "legendary",
    count: 1,
    firstObtainedAt: "2026-10-03",
  },
  { clubId: "albi", rarity: "rare", count: 1, firstObtainedAt: "2026-10-02" },
  {
    clubId: "inconnu",
    rarity: "rare",
    count: 1,
    firstObtainedAt: "2026-10-04",
  },
];

const ids = (filters: Parameters<typeof filterCollection>[2]) =>
  filterCollection(collection, clubsById, filters).map(
    (entry) => entry.club.id,
  );

describe("filterCollection", () => {
  it("ignore les cartes dont le club n'existe plus", () => {
    expect(ids({ rarity: null, division: null, sort: "name" })).toEqual([
      "cugnaux",
      "albi",
      "toulouse",
    ]);
  });

  it("trie par date, puissance et rareté", () => {
    expect(ids({ rarity: null, division: null, sort: "recent" })).toEqual([
      "cugnaux",
      "albi",
      "toulouse",
    ]);
    expect(ids({ rarity: null, division: null, sort: "power" })).toEqual([
      "toulouse",
      "albi",
      "cugnaux",
    ]);
    expect(ids({ rarity: null, division: null, sort: "rarity" })).toEqual([
      "cugnaux",
      "albi",
      "toulouse",
    ]);
  });

  it("filtre par rareté et par division", () => {
    expect(ids({ rarity: "rare", division: null, sort: "name" })).toEqual([
      "albi",
    ]);
    expect(ids({ rarity: null, division: "top14", sort: "name" })).toEqual([
      "toulouse",
    ]);
    expect(ids({ rarity: "epic", division: "top14", sort: "name" })).toEqual(
      [],
    );
  });
});
