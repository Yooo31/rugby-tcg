import { crestStyleSchema } from "./crest";

describe("choix de blason", () => {
  it("accepte des choix connus, tous facultatifs", () => {
    expect(crestStyleSchema.safeParse({}).success).toBe(true);
    expect(
      crestStyleSchema.safeParse({
        shape: "rounded",
        pattern: "stripes",
        symbol: "volcano",
      }).success,
    ).toBe(true);
  });

  it.each([
    ["une forme", { shape: "ovale" }],
    ["un motif", { pattern: "damier" }],
    ["un symbole", { symbol: "coq" }],
  ])("refuse %s inconnu", (_label, choice) => {
    expect(crestStyleSchema.safeParse(choice).success).toBe(false);
  });
});
