// @vitest-environment node
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { updateSession } from "./proxy";

vi.mock("./env", () => ({
  SUPABASE_URL: "https://supabase.test",
  SUPABASE_PUBLISHABLE_KEY: "clé",
}));
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

type CookieOptions = Parameters<typeof createServerClient>[2]["cookies"];

/** Client simulé : connecté ou non, et qui renouvelle le jeton comme Supabase. */
function signedIn(isSignedIn: boolean) {
  vi.mocked(createServerClient).mockImplementation(((
    _url: string,
    _key: string,
    { cookies }: { cookies: CookieOptions },
  ) => ({
    auth: {
      getClaims: async () => {
        cookies.setAll?.([{ name: "sb-jeton", value: "neuf", options: {} }], {
          "Cache-Control": "private, no-cache, no-store",
        });
        return { data: isSignedIn ? { claims: { sub: "u1" } } : null };
      },
    },
  })) as unknown as typeof createServerClient);
}

const request = (path: string) => new NextRequest(`https://jeu.test${path}`);

describe("aiguillage des requêtes", () => {
  it("laisse passer un joueur connecté et lui pose le jeton renouvelé", async () => {
    signedIn(true);
    const response = await updateSession(request("/collection"));
    expect(response.headers.get("location")).toBeNull();
    expect(response.cookies.get("sb-jeton")?.value).toBe("neuf");
    expect(response.headers.get("Cache-Control")).toContain("no-store");
  });

  it("envoie un visiteur à la connexion, en retenant la page demandée", async () => {
    signedIn(false);
    const response = await updateSession(request("/albums?tri=nom"));
    const url = new URL(response.headers.get("location") ?? "");
    expect(url.pathname).toBe("/connexion");
    expect(url.searchParams.get("next")).toBe("/albums");
    expect(response.cookies.get("sb-jeton")?.value).toBe("neuf");
  });

  it("ne retient pas l'accueil comme page de retour", async () => {
    signedIn(false);
    const response = await updateSession(request("/"));
    expect(new URL(response.headers.get("location") ?? "").search).toBe("");
  });

  it("laisse un visiteur sur les pages publiques", async () => {
    signedIn(false);
    const response = await updateSession(request("/connexion"));
    expect(response.headers.get("location")).toBeNull();
  });

  it("renvoie un joueur connecté au jeu depuis les pages d'authentification", async () => {
    signedIn(true);
    const response = await updateSession(request("/inscription"));
    expect(new URL(response.headers.get("location") ?? "").pathname).toBe("/");
  });
});
