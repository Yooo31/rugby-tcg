import { deleteAccountSchema } from "./schemas";

describe("confirmation de suppression du compte", () => {
  it("exige le mot de passe et le mot SUPPRIMER, sans tenir compte de la casse", () => {
    expect(
      deleteAccountSchema.safeParse({
        password: "x",
        confirmation: " supprimer ",
      }).success,
    ).toBe(true);
    expect(
      deleteAccountSchema.safeParse({ password: "x", confirmation: "oui" })
        .success,
    ).toBe(false);
    expect(
      deleteAccountSchema.safeParse({ password: "", confirmation: "SUPPRIMER" })
        .success,
    ).toBe(false);
  });
});
