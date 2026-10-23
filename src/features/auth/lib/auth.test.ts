import { parseForm } from "./form-state";
import { authErrorMessage, UNKNOWN_ERROR } from "./messages";
import { signInSchema, signUpSchema, updatePasswordSchema } from "./schemas";

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

describe("schémas d'authentification", () => {
  it("normalise l'adresse e-mail", () => {
    const parsed = signInSchema.parse({
      email: "  Jean@Exemple.FR ",
      password: "x",
    });
    expect(parsed.email).toBe("jean@exemple.fr");
  });

  it("exige 8 caractères à l'inscription, pas à la connexion", () => {
    expect(
      signUpSchema.safeParse({ email: "a@b.fr", password: "court" }).success,
    ).toBe(false);
    expect(
      signInSchema.safeParse({ email: "a@b.fr", password: "court" }).success,
    ).toBe(true);
    expect(
      updatePasswordSchema.safeParse({ password: "12345678" }).success,
    ).toBe(true);
  });
});

describe("parseForm", () => {
  it("renvoie les données valides", () => {
    const parsed = parseForm(
      signInSchema,
      form({ email: "a@b.fr", password: "secret" }),
    );
    expect(parsed).toEqual({ data: { email: "a@b.fr", password: "secret" } });
  });

  it("renvoie une erreur par champ et les valeurs saisies, jamais le mot de passe", () => {
    const parsed = parseForm(
      signUpSchema,
      form({ username: "a b", email: "pas-une-adresse", password: "court" }),
    );
    if (!("state" in parsed))
      throw new Error("Le formulaire aurait dû être refusé.");
    expect(Object.keys(parsed.state.fieldErrors ?? {})).toEqual([
      "username",
      "email",
      "password",
    ]);
    expect(parsed.state.values).toEqual({
      username: "a b",
      email: "pas-une-adresse",
    });
  });

  it("exige un pseudo valide à l'inscription", () => {
    const parsed = parseForm(
      signUpSchema,
      form({ username: "Pilier_31", email: "a@b.fr", password: "motdepasse" }),
    );
    expect(parsed).toEqual({
      data: { username: "Pilier_31", email: "a@b.fr", password: "motdepasse" },
    });
  });
});

describe("authErrorMessage", () => {
  it("traduit les erreurs connues", () => {
    expect(authErrorMessage("invalid_credentials")).toMatch(/incorrect/);
  });

  it("reste vague sur une erreur inconnue", () => {
    expect(authErrorMessage("quelque_chose")).toBe(UNKNOWN_ERROR);
    expect(authErrorMessage(undefined)).toBe(UNKNOWN_ERROR);
  });
});
