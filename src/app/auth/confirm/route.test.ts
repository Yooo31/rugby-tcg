// @vitest-environment node
import { NextRequest } from "next/server";
import { ensurePlayer } from "@/features/auth/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { GET } from "./route";

vi.mock("@/features/auth/server", () => ({ ensurePlayer: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

const user = { id: "u1" };
const auth = {
  exchangeCodeForSession: vi.fn(async () => ({ data: { user }, error: null })),
  verifyOtp: vi.fn(async () => ({ data: { user }, error: null })),
};

beforeEach(() => {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth,
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
});

async function follow(query: string): Promise<URL> {
  const response = await GET(
    new NextRequest(`https://jeu.test/auth/confirm?${query}`),
  );
  return new URL(response.headers.get("location") ?? "");
}

describe("retour d'un lien reçu par e-mail", () => {
  it("échange le code contre une session et va à la page prévue", async () => {
    const url = await follow("code=abc&next=/compte/mot-de-passe");
    expect(auth.exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(ensurePlayer).toHaveBeenCalledWith(user);
    expect(url.pathname).toBe("/compte/mot-de-passe");
    expect(url.search).toBe("");
  });

  it("vérifie un jeton de modèle personnalisé", async () => {
    const url = await follow("token_hash=h&type=signup");
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      type: "signup",
      token_hash: "h",
    });
    expect(url.pathname).toBe("/");
  });

  it("n'envoie jamais hors du site", async () => {
    const url = await follow("code=abc&next=//pirate.test");
    expect(url.host).toBe("jeu.test");
    expect(url.pathname).toBe("/");
  });

  it("renvoie à la connexion si le lien est incomplet ou expiré", async () => {
    const incomplete = await follow("type=signup");
    expect(incomplete.pathname).toBe("/connexion");
    expect(incomplete.searchParams.get("lien")).toBe("invalide");

    auth.exchangeCodeForSession.mockResolvedValueOnce({
      data: { user: null },
      error: new Error("expiré"),
    } as never);
    expect((await follow("code=vieux")).pathname).toBe("/connexion");
    expect(ensurePlayer).not.toHaveBeenCalled();
  });
});
