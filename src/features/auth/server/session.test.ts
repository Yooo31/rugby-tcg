import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAuthUser } from "./session";

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: vi.fn() }));
vi.mock("@/data/server", () => ({ ensurePlayer: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: vi.fn(),
}));

function withClaims(claims: Record<string, unknown> | undefined) {
  vi.mocked(createSupabaseServerClient).mockResolvedValue({
    auth: { getClaims: async () => ({ data: claims ? { claims } : null }) },
  } as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>);
}

describe("joueur connecté", () => {
  it("vient du jeton vérifié", async () => {
    withClaims({ sub: "u1", email: "a@b.fr" });
    expect(await getAuthUser()).toEqual({ id: "u1", email: "a@b.fr" });
  });

  it("n'a pas d'adresse si le jeton n'en porte pas", async () => {
    withClaims({ sub: "u1" });
    expect(await getAuthUser()).toEqual({ id: "u1", email: null });
  });

  it("n'existe pas sans jeton valide", async () => {
    withClaims(undefined);
    expect(await getAuthUser()).toBeNull();
    withClaims({ email: "a@b.fr" });
    expect(await getAuthUser()).toBeNull();
  });
});
