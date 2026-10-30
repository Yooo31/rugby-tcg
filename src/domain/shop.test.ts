import {
  bestPack,
  creditIngotPack,
  packBonusPercent,
  getIngotPack,
  ingotPackIdSchema,
  INGOT_PACKS,
} from "./shop";

describe("boutique de lingots", () => {
  it("propose quatre paquets, du plus petit au plus gros", () => {
    expect(
      INGOT_PACKS.map(({ ingots, priceCents }) => [ingots, priceCents]),
    ).toEqual([
      [200, 199],
      [700, 599],
      [1_500, 1_199],
      [3_600, 2_499],
    ]);
  });

  it("donne plus de lingots par euro dans les gros paquets", () => {
    const perEuro = INGOT_PACKS.map(
      ({ ingots, priceCents }) => ingots / priceCents,
    );
    perEuro
      .slice(1)
      .forEach((value, index) =>
        expect(value).toBeGreaterThan(perEuro[index]!),
      );
  });

  it("affiche un bonus réel, arrondi vers le bas, et la meilleure offre", () => {
    expect(INGOT_PACKS.map(packBonusPercent)).toEqual([0, 16, 24, 43]);
    expect(bestPack().id).toBe("trunk");
  });

  it("crédite les lingots d'un paquet, sans toucher aux boosters", () => {
    expect(creditIngotPack({ ingots: 30, bonusBoosters: 2 }, "bag")).toEqual({
      ingots: 730,
      bonusBoosters: 2,
    });
  });

  it("refuse un paquet inconnu", () => {
    expect(ingotPackIdSchema.safeParse("trunk").success).toBe(true);
    expect(ingotPackIdSchema.safeParse("gratuit").success).toBe(false);
    expect(() => getIngotPack("gratuit" as never)).toThrow();
  });
});
