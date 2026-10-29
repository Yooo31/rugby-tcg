import {
  creditIngotPack,
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
      [650, 599],
      [1_400, 1_199],
      [3_000, 2_499],
    ]);
  });

  it("donne plus de lingots par euro dans les gros paquets", () => {
    const perEuro = INGOT_PACKS.map(
      ({ ingots, priceCents }) => ingots / priceCents,
    );
    expect([...perEuro].sort((a, b) => a - b)).toEqual(perEuro);
  });

  it("crédite les lingots d'un paquet, sans toucher aux boosters", () => {
    expect(creditIngotPack({ ingots: 30, bonusBoosters: 2 }, "bag")).toEqual({
      ingots: 680,
      bonusBoosters: 2,
    });
  });

  it("refuse un paquet inconnu", () => {
    expect(ingotPackIdSchema.safeParse("trunk").success).toBe(true);
    expect(ingotPackIdSchema.safeParse("gratuit").success).toBe(false);
    expect(() => getIngotPack("gratuit" as never)).toThrow();
  });
});
