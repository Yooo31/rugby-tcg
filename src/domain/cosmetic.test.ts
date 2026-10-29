import {
  buyCosmetic,
  COSMETIC_KINDS,
  COSMETICS,
  cosmeticsOfKind,
  CosmeticUnavailableError,
  DEFAULT_COSMETICS,
  DEFAULT_EQUIPPED,
  earnedCosmetics,
  equipCosmetic,
  getCosmetic,
  ownedCosmeticIds,
  parseEquipped,
  parseOwnedCosmetics,
  withEarnedCosmetics,
} from "./cosmetic";
import { InsufficientIngotsError } from "./wallet";

const NOTHING = { streakDays: 0, completedAlbums: 0 };

describe("catalogue des cosmétiques", () => {
  it("propose 3 à 4 cosmétiques par sorte, dont un de départ gratuit", () => {
    for (const kind of COSMETIC_KINDS) {
      const ofKind = cosmeticsOfKind(kind);
      expect(ofKind.length).toBeGreaterThanOrEqual(3);
      expect(ofKind.length).toBeLessThanOrEqual(4);
      expect(getCosmetic(DEFAULT_COSMETICS[kind])).toMatchObject({
        kind,
        ingots: 0,
      });
    }
  });

  it("a des identifiants uniques et des prix positifs hors départ", () => {
    expect(new Set(COSMETICS.map(({ id }) => id)).size).toBe(COSMETICS.length);
    for (const cosmetic of COSMETICS) {
      if (cosmetic.ingots === 0) continue;
      expect(cosmetic.priceCents).toBeGreaterThan(0);
    }
  });

  it("refuse un identifiant inconnu", () => {
    // @ts-expect-error -- identifiant hors catalogue, exprès
    expect(() => getCosmetic("logo-du-club")).toThrow();
  });
});

describe("achat d'un cosmétique", () => {
  it("dépense les lingots et ajoute le cosmétique", () => {
    const result = buyCosmetic(
      { ingots: 300, bonusBoosters: 2 },
      [],
      "back-night",
    );
    expect(result).toEqual({
      wallet: { ingots: 150, bonusBoosters: 2 },
      owned: ["back-night"],
    });
  });

  it("refuse si le solde manque", () => {
    expect(() =>
      buyCosmetic({ ingots: 10, bonusBoosters: 0 }, [], "back-night"),
    ).toThrow(InsufficientIngotsError);
  });

  it("refuse un cosmétique déjà possédé, ou celui de départ", () => {
    const wallet = { ingots: 1_000, bonusBoosters: 0 };
    expect(() => buyCosmetic(wallet, ["back-night"], "back-night")).toThrow(
      CosmeticUnavailableError,
    );
    expect(() => buyCosmetic(wallet, [], "back-pitch")).toThrow(
      CosmeticUnavailableError,
    );
  });
});

describe("équipement", () => {
  it("équipe un cosmétique possédé dans sa sorte", () => {
    expect(
      equipCosmetic(DEFAULT_EQUIPPED, ["frame-stitch"], "frame-stitch"),
    ).toEqual({ ...DEFAULT_EQUIPPED, "card-frame": "frame-stitch" });
  });

  it("équipe toujours un cosmétique de départ", () => {
    const equipped = {
      ...DEFAULT_EQUIPPED,
      "card-back": "back-night",
    } as const;
    expect(equipCosmetic(equipped, [], "back-pitch")).toEqual(DEFAULT_EQUIPPED);
  });

  it("refuse un cosmétique non possédé", () => {
    expect(() => equipCosmetic(DEFAULT_EQUIPPED, [], "theme-pitch")).toThrow(
      CosmeticUnavailableError,
    );
  });
});

describe("cosmétiques gagnés", () => {
  it("rien sans exploit", () => {
    expect(earnedCosmetics(NOTHING)).toEqual([]);
  });

  it("un dos pour 30 jours de série, un cadre pour un album terminé", () => {
    expect(earnedCosmetics({ streakDays: 29, completedAlbums: 0 })).toEqual([]);
    expect(earnedCosmetics({ streakDays: 30, completedAlbums: 1 })).toEqual([
      "back-chalk",
      "frame-touchline",
    ]);
  });

  it("garde ce qui est acquis et n'ajoute qu'une fois", () => {
    const owned = withEarnedCosmetics(["back-night"], {
      streakDays: 30,
      completedAlbums: 0,
    });
    expect(owned).toEqual(["back-night", "back-chalk"]);
    expect(
      withEarnedCosmetics(owned, { streakDays: 31, completedAlbums: 0 }),
    ).toBe(owned);
    expect(withEarnedCosmetics(owned, NOTHING)).toBe(owned);
  });
});

describe("lecture d'un stockage", () => {
  it("ajoute les cosmétiques de départ, dans l'ordre du catalogue", () => {
    expect(ownedCosmeticIds(["theme-pitch", "back-leather"])).toEqual([
      "back-pitch",
      "back-leather",
      "frame-plain",
      "theme-night",
      "theme-pitch",
    ]);
  });

  it("ignore les identifiants inconnus et ceux de départ", () => {
    expect(
      parseOwnedCosmetics(["retire", "back-pitch", "frame-stitch"]),
    ).toEqual(["frame-stitch"]);
  });

  it("revient au départ pour un équipement inconnu ou d'une autre sorte", () => {
    expect(
      parseEquipped({
        "card-back": "back-night",
        "card-frame": "theme-pitch",
        "album-theme": null,
      }),
    ).toEqual({ ...DEFAULT_EQUIPPED, "card-back": "back-night" });
  });
});
