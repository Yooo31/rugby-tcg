import {
  adjustmentSchema,
  applyAdjustment,
  NegativeBalanceError,
} from "./adjustment";

describe("corrections d'administration", () => {
  const wallet = { ingots: 100, bonusBoosters: 1 };

  it("ajoute ou retire lingots et boosters bonus", () => {
    expect(
      applyAdjustment(wallet, {
        ingotsDelta: -40,
        boostersDelta: 2,
        reason: "Bug",
      }),
    ).toEqual({ ingots: 60, bonusBoosters: 3 });
  });

  it("refuse de rendre un solde négatif", () => {
    expect(() =>
      applyAdjustment(wallet, {
        ingotsDelta: 0,
        boostersDelta: -2,
        reason: "Bug",
      }),
    ).toThrow(NegativeBalanceError);
  });

  it("exige une raison et un changement", () => {
    const valid = {
      ingotsDelta: 50,
      boostersDelta: 0,
      reason: "Geste commercial",
    };
    expect(adjustmentSchema.safeParse(valid).success).toBe(true);
    expect(adjustmentSchema.safeParse({ ...valid, reason: " " }).success).toBe(
      false,
    );
    expect(
      adjustmentSchema.safeParse({ ...valid, ingotsDelta: 0 }).success,
    ).toBe(false);
    expect(
      adjustmentSchema.safeParse({ ...valid, ingotsDelta: 1e9 }).success,
    ).toBe(false);
  });
});
