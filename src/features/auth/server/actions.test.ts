import { accountData, isUsernameAvailable, referralData } from "@/data/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { deleteAccount, signUp } from "./actions";
import { ensurePlayer, getAuthUser } from "./session";

vi.mock("server-only", () => ({}));
// Comme dans Next.js, une redirection interrompt l'action en levant une erreur.
vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirection vers ${path}`);
  }),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));
vi.mock("@/data/server", () => ({
  isUsernameAvailable: vi.fn(async () => true),
  referralData: { codeExists: vi.fn(async () => true) },
  accountData: { delete: vi.fn(async () => undefined) },
}));
vi.mock("./session", () => ({
  ensurePlayer: vi.fn(async () => undefined),
  getAuthUser: vi.fn(),
}));

const auth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(async () => ({ error: null })),
};

beforeEach(() => {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth,
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
});

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

const SIGN_UP = {
  username: "Ovalie_31",
  email: "joueur@rugby-tcg.test",
  password: "MotDePasse-2026",
  acceptsTerms: "on",
};

describe("inscription", () => {
  it("renvoie les erreurs de saisie sans appeler Supabase", async () => {
    const state = await signUp(
      {},
      form({ ...SIGN_UP, email: "pas-une-adresse" }),
    );
    expect(state.fieldErrors?.["email"]).toBeDefined();
    expect(state.values).not.toHaveProperty("password");
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("exige la déclaration d'âge et l'acceptation des CGU", async () => {
    const state = await signUp({}, form({ ...SIGN_UP, acceptsTerms: "" }));
    expect(state.fieldErrors?.["acceptsTerms"]).toContain("15 ans");
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("refuse un pseudo déjà pris", async () => {
    vi.mocked(isUsernameAvailable).mockResolvedValueOnce(false);
    const state = await signUp({}, form(SIGN_UP));
    expect(state.fieldErrors?.["username"]).toBeDefined();
    expect(auth.signUp).not.toHaveBeenCalled();
  });

  it("refuse un code de parrainage inconnu", async () => {
    vi.mocked(referralData.codeExists).mockResolvedValueOnce(false);
    const state = await signUp(
      {},
      form({ ...SIGN_UP, referralCode: "ABC234" }),
    );
    expect(state.fieldErrors?.["referralCode"]).toBe(
      "Ce code de parrainage n'existe pas.",
    );
  });

  it("traduit une erreur de Supabase", async () => {
    auth.signUp.mockResolvedValueOnce({
      data: {},
      error: { code: "over_email_send_rate_limit" },
    });
    const state = await signUp({}, form(SIGN_UP));
    expect(state.error).toBeTruthy();
    expect(state.values?.["email"]).toBe(SIGN_UP.email);
  });

  it("garde pseudo et parrain dans le compte, puis annonce l'e-mail de confirmation", async () => {
    auth.signUp.mockResolvedValueOnce({
      data: { user: { id: "u1" }, session: null },
      error: null,
    });
    const state = await signUp(
      {},
      form({ ...SIGN_UP, referralCode: "abc234" }),
    );
    expect(auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: SIGN_UP.email,
        options: expect.objectContaining({
          data: {
            username: SIGN_UP.username,
            referralCode: "ABC234",
            termsAcceptedAt: expect.any(String),
          },
        }),
      }),
    );
    expect(state.notice).toContain(SIGN_UP.email);
    expect(ensurePlayer).not.toHaveBeenCalled();
  });

  it("crée le joueur et entre dans le jeu quand la session est ouverte tout de suite", async () => {
    const user = { id: "u1" };
    auth.signUp.mockResolvedValueOnce({
      data: { user, session: {} },
      error: null,
    });
    await expect(signUp({}, form(SIGN_UP))).rejects.toThrow(
      "redirection vers /",
    );
    expect(ensurePlayer).toHaveBeenCalledWith(user);
  });
});

describe("suppression du compte", () => {
  const CONFIRMED = { password: "secret", confirmation: "SUPPRIMER" };

  it("exige la confirmation", async () => {
    const state = await deleteAccount(
      {},
      form({ ...CONFIRMED, confirmation: "oui" }),
    );
    expect(state.fieldErrors?.["confirmation"]).toBeDefined();
    expect(state).not.toHaveProperty("values");
  });

  it("exige une session", async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    const state = await deleteAccount({}, form(CONFIRMED));
    expect(state.error).toBeTruthy();
    expect(accountData.delete).not.toHaveBeenCalled();
  });

  it("refuse un mauvais mot de passe", async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({ id: "u1", email: "a@b.fr" });
    auth.signInWithPassword.mockResolvedValueOnce({ error: { code: "x" } });
    const state = await deleteAccount({}, form(CONFIRMED));
    expect(state.fieldErrors?.["password"]).toBe("Mot de passe incorrect.");
    expect(accountData.delete).not.toHaveBeenCalled();
  });

  it("supprime le compte, ferme la session et renvoie vers la connexion", async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce({ id: "u1", email: "a@b.fr" });
    auth.signInWithPassword.mockResolvedValueOnce({ error: null });
    auth.signOut.mockRejectedValueOnce(new Error("session déjà close"));
    const state = await deleteAccount({}, form(CONFIRMED));
    expect(auth.signInWithPassword).toHaveBeenCalledWith({
      email: "a@b.fr",
      password: "secret",
    });
    expect(accountData.delete).toHaveBeenCalledWith("u1");
    expect(state.redirectTo).toBe("/connexion?compte=supprime");
  });
});
