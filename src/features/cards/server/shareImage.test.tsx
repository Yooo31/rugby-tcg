// @vitest-environment node
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { catalogClub, ownsCard } from "@/data/server";
import { CLUB_CATALOG } from "@/data/catalog";
import { getAuthUser } from "@/features/auth/server";
import { shareImageResponse } from "./shareImage";

vi.mock("server-only", () => ({}));
// Le moteur d'image n'est pas lancé : on garde l'élément à dessiner.
vi.mock("next/og", () => ({
  ImageResponse: class extends Response {
    readonly element: ReactElement;
    constructor(element: ReactElement) {
      super("image");
      this.element = element;
    }
  },
}));
vi.mock("@/features/auth/server", () => ({ getAuthUser: vi.fn() }));
vi.mock("@/data/server", async () => {
  const { CLUB_CATALOG } = await import("@/data/catalog");
  return {
    catalogClub: vi.fn(
      (id: string) => CLUB_CATALOG.find((club) => club.id === id) ?? null,
    ),
    ownsCard: vi.fn(async () => true),
    referralData: { summary: vi.fn(async () => ({ code: "ABC234" })) },
  };
});

const club = CLUB_CATALOG[0];
const share = (query: string) =>
  shareImageResponse(new Request(`https://jeu.test/partage/carte?${query}`));

beforeEach(() => {
  vi.mocked(getAuthUser).mockResolvedValue({ id: "u1", email: null });
});

describe("image de partage d'une carte", () => {
  it("exige d'être connecté", async () => {
    vi.mocked(getAuthUser).mockResolvedValueOnce(null);
    expect((await share(`club=${club.id}&rarete=epic`)).status).toBe(401);
  });

  it("refuse un club, une rareté ou une carte que le joueur n'a pas", async () => {
    expect((await share("club=inconnu&rarete=epic")).status).toBe(404);
    expect((await share(`club=${club.id}&rarete=mythique`)).status).toBe(404);
    expect((await share("rarete=epic")).status).toBe(404);
    vi.mocked(ownsCard).mockResolvedValueOnce(false);
    expect((await share(`club=${club.id}&rarete=legendary`)).status).toBe(404);
  });

  it("dessine la carte avec le club, la rareté et le code de parrainage", async () => {
    const response = (await share(
      `club=${club.id}&rarete=legendary`,
    )) as Response & { element: ReactElement };
    expect(response.status).toBe(200);
    expect(ownsCard).toHaveBeenCalledWith("u1", club.id, "legendary");
    expect(catalogClub).toHaveBeenCalledWith(club.id);
    const markup = renderToStaticMarkup(response.element);
    expect(markup).toContain(club.name);
    expect(markup).toContain("ABC234");
    expect(markup).toMatch(/légendaire/i);
  });
});
