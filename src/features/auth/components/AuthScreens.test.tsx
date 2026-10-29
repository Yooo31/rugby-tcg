import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import * as actions from "../server/actions";
import { SignInScreen, SignUpScreen } from "./AuthScreens";

const search = vi.hoisted(() => ({ query: "" }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(search.query),
}));
vi.mock("../server/actions", () => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  requestPasswordReset: vi.fn(),
  updatePassword: vi.fn(),
}));

const mocked = vi.mocked(actions);

afterEach(() => {
  search.query = "";
});

describe("écran de connexion", () => {
  it("prévient d'un lien expiré et d'un compte supprimé", () => {
    search.query = "lien=invalide&compte=supprime";
    render(<SignInScreen />);
    expect(screen.getByRole("alert")).toHaveTextContent("plus valable");
    expect(screen.getByRole("status")).toHaveTextContent("supprimés");
  });

  it("transmet la page de retour et garde l'adresse après un refus", async () => {
    search.query = "next=/albums";
    const user = userEvent.setup();
    mocked.signIn.mockResolvedValueOnce({
      error: "Adresse ou mot de passe incorrect.",
      values: { email: "joueur@rugby-tcg.test" },
    });
    render(<SignInScreen />);
    await user.type(
      screen.getByLabelText("Adresse e-mail"),
      "joueur@rugby-tcg.test",
    );
    await user.type(screen.getByLabelText("Mot de passe"), "faux");
    await user.click(screen.getByRole("button", { name: "Se connecter" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("incorrect");
    expect(mocked.signIn.mock.calls[0][1].get("next")).toBe("/albums");
    expect(screen.getByLabelText("Adresse e-mail")).toHaveValue(
      "joueur@rugby-tcg.test",
    );
  });
});

describe("écran d'inscription", () => {
  it("préremplit le code du parrain venu par lien", () => {
    search.query = "parrain=ABC234";
    render(<SignUpScreen />);
    expect(
      screen.getByLabelText("Code de parrainage (facultatif)"),
    ).toHaveValue("ABC234");
  });

  it("affiche les erreurs de chaque champ et garde la saisie", async () => {
    const user = userEvent.setup();
    mocked.signUp.mockResolvedValueOnce({
      fieldErrors: {
        username: "Ce pseudo est déjà pris.",
        referralCode: "Ce code de parrainage n'existe pas.",
      },
      values: { username: "Ovalie", email: "a@b.fr", referralCode: "ZZZZZZ" },
    });
    render(<SignUpScreen />);
    await user.type(screen.getByLabelText("Pseudo"), "Ovalie");
    await user.type(screen.getByLabelText("Adresse e-mail"), "a@b.fr");
    await user.type(screen.getByLabelText("Mot de passe"), "MotDePasse-2026");
    await user.click(screen.getByLabelText(/J'ai 15 ans ou plus/));
    await user.click(screen.getByRole("button", { name: "Créer mon compte" }));

    expect(
      await screen.findByText("Ce pseudo est déjà pris."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ce code de parrainage n'existe pas."),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Code de parrainage (facultatif)"),
    ).toHaveValue("ZZZZZZ");
  });
});
