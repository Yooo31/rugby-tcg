import {
  productLabel,
  productPriceCents,
  purchaseProductSchema,
} from "./purchase";

const SEASON_ID = "6f1c2a3b-4d5e-4f60-8a7b-9c0d1e2f3a4b";

describe("produits payants", () => {
  it("donne le prix et le libellé de chaque produit", () => {
    expect(productPriceCents({ kind: "ingots", id: "bag" })).toBe(599);
    expect(productLabel({ kind: "ingots", id: "bag" })).toBe("650 lingots");
    expect(productPriceCents({ kind: "vip", id: "vip-year" })).toBe(4_999);
    expect(productLabel({ kind: "vip", id: "vip-month" })).toBe(
      "Pass VIP, un mois",
    );
    expect(productPriceCents({ kind: "season-pass", id: SEASON_ID })).toBe(599);
    expect(productLabel({ kind: "season-pass", id: SEASON_ID })).toBe(
      "Passe de saison, voie payante",
    );
  });

  it("refuse un produit inconnu", () => {
    expect(
      purchaseProductSchema.safeParse({ kind: "ingots", id: "gratuit" })
        .success,
    ).toBe(false);
    expect(
      purchaseProductSchema.safeParse({ kind: "cosmetic", id: "back-night" })
        .success,
    ).toBe(false);
    expect(
      purchaseProductSchema.safeParse({ kind: "season-pass", id: "s1" })
        .success,
    ).toBe(false);
  });
});
