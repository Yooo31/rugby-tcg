import { usernameSchema } from "./username";

describe("pseudo", () => {
  it("accepte lettres accentuées, chiffres, point et tirets", () => {
    for (const name of ["Pilier", "Éric_31", "talonneur.du-sud", "abc"])
      expect(usernameSchema.safeParse(name).success, name).toBe(true);
  });

  it("retire les espaces autour", () => {
    expect(usernameSchema.parse("  Ouvreur  ")).toBe("Ouvreur");
  });

  it("refuse trop court, trop long, espaces et symboles", () => {
    for (const name of ["ab", "x".repeat(21), "deux mots", "<script>", "a@b"])
      expect(usernameSchema.safeParse(name).success, name).toBe(false);
  });
});
