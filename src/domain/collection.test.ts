import {
  addCards,
  bestRarityByClub,
  duplicateCount,
  ownedClubIds,
  totalCards,
  type Collection,
} from "./collection";

const at = "2026-10-13T10:00:00.000Z";

describe("addCards", () => {
  it("crée les cartes et signale les nouveautés", () => {
    const { collection, pulled } = addCards(
      [],
      [{ clubId: "a", rarity: "common" }],
      at,
    );
    expect(collection).toEqual([
      { clubId: "a", rarity: "common", count: 1, firstObtainedAt: at },
    ]);
    expect(pulled).toEqual([
      { clubId: "a", rarity: "common", isNewClub: true, isNewCard: true },
    ]);
  });

  it("empile les doublons sans changer la date de première obtention", () => {
    const initial: Collection = [
      { clubId: "a", rarity: "common", count: 1, firstObtainedAt: at },
    ];
    const { collection, pulled } = addCards(
      initial,
      [{ clubId: "a", rarity: "common" }],
      "plus tard",
    );
    expect(collection).toEqual([
      { clubId: "a", rarity: "common", count: 2, firstObtainedAt: at },
    ]);
    expect(pulled[0]).toMatchObject({ isNewClub: false, isNewCard: false });
  });

  it("distingue une nouvelle rareté d'un club déjà connu", () => {
    const initial: Collection = [
      { clubId: "a", rarity: "common", count: 1, firstObtainedAt: at },
    ];
    const { collection, pulled } = addCards(
      initial,
      [{ clubId: "a", rarity: "epic" }],
      at,
    );
    expect(collection).toHaveLength(2);
    expect(pulled[0]).toMatchObject({ isNewClub: false, isNewCard: true });
  });

  it("ne marque nouveau qu'une fois un club tiré deux fois dans le même lot", () => {
    const { pulled } = addCards(
      [],
      [
        { clubId: "a", rarity: "common" },
        { clubId: "a", rarity: "rare" },
      ],
      at,
    );
    expect(pulled.map((card) => card.isNewClub)).toEqual([true, false]);
  });

  it("ne mute pas la collection d'origine", () => {
    const initial: Collection = Object.freeze([
      Object.freeze({
        clubId: "a",
        rarity: "common" as const,
        count: 1,
        firstObtainedAt: at,
      }),
    ]);
    expect(() =>
      addCards(initial, [{ clubId: "a", rarity: "common" }], at),
    ).not.toThrow();
    expect(initial[0].count).toBe(1);
  });
});

describe("statistiques de collection", () => {
  const collection: Collection = [
    { clubId: "a", rarity: "common", count: 3, firstObtainedAt: at },
    { clubId: "a", rarity: "legendary", count: 1, firstObtainedAt: at },
    { clubId: "b", rarity: "rare", count: 1, firstObtainedAt: at },
  ];

  it("liste les clubs possédés sans doublon", () => {
    expect([...ownedClubIds(collection)]).toEqual(["a", "b"]);
  });

  it("retient la meilleure rareté de chaque club", () => {
    expect(Object.fromEntries(bestRarityByClub(collection))).toEqual({
      a: "legendary",
      b: "rare",
    });
  });

  it("compte les exemplaires et les doublons", () => {
    expect(totalCards(collection)).toBe(5);
    expect(duplicateCount(collection)).toBe(2);
  });
});
