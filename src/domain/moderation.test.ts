import { isUsernameAllowed, normalizeForModeration } from "./moderation";
import { usernameSchema } from "./username";

describe("modération des pseudos", () => {
  it("normalise accents, casse et chiffres déguisés", () => {
    expect(normalizeForModeration("Éncülé_31")).toBe("encule_ei");
    expect(normalizeForModeration("S4L0P3")).toBe("salope");
  });

  it("refuse insultes, propos haineux et usurpation, même déguisés", () => {
    for (const name of [
      "Connard",
      "s4l0pe",
      "Le.Nazi",
      "ADMIN",
      "Modo",
      "pd-31",
      "FFR_officiel",
      "fils.de.pute",
    ])
      expect(isUsernameAllowed(name), name).toBe(false);
  });

  it("accepte les noms de lieux et de joueurs qui contiennent un mot court", () => {
    for (const name of [
      "Concarneau",
      "Ducon_Rugby",
      "Culoz",
      "Pilier_31",
      "Castres81",
      "Dispute",
    ])
      expect(isUsernameAllowed(name), name).toBe(true);
  });

  it("est appliquée par le schéma du pseudo", () => {
    const result = usernameSchema.safeParse("Connard");
    expect(result.success).toBe(false);
    if (!result.success)
      expect(result.error.issues[0]?.message).toMatch(/autorisé/);
  });
});
