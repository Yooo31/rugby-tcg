import { render, screen, within } from "@testing-library/react";
import { notFound } from "next/navigation";
import { adminData } from "@/data/server";
import { createInMemoryRepositories } from "@/data";
import { createSeededRng } from "@/lib/rng";
import { AdminGiveawaysPage, AdminPlayerPage, AdminSeasonsPage } from "./pages";

vi.mock("server-only", () => ({}));
// Comme dans Next.js, une page introuvable interrompt le rendu.
vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("introuvable");
  }),
}));
vi.mock("./guard", () => ({ requireAdmin: vi.fn(async () => ({})) }));
vi.mock("./actions", () => ({
  adjustPlayerAction: vi.fn(),
  createGiveawayAction: vi.fn(),
  endGiveawayAction: vi.fn(),
  resetUsernameAction: vi.fn(),
  sendTestErrorAction: vi.fn(),
  createSeasonAction: vi.fn(),
  endSeasonAction: vi.fn(),
  grantSeasonPassAction: vi.fn(),
}));
vi.mock("@/data/server", () => ({
  adminData: {
    getPlayerDetail: vi.fn(),
    listGiveaways: vi.fn(),
    listSeasons: vi.fn(),
  },
}));

const PLAYER_ID = "00000000-0000-4000-8000-000000000001";
const HOUR_MS = 3_600_000;

async function playerDetail(username: string | null) {
  const repositories = createInMemoryRepositories(createSeededRng(1));
  if (username) await repositories.player.setUsername(username);
  return {
    id: PLAYER_ID,
    email: "joueur@rugby-tcg.test",
    createdAt: new Date("2026-10-01T10:00:00Z"),
    snapshot: await repositories.player.get(),
    openings: 0,
    lastOpeningAt: null,
    adjustments: [],
  };
}

async function renderPlayerPage(playerId = PLAYER_ID) {
  render(await AdminPlayerPage({ params: Promise.resolve({ playerId }) }));
}

describe("fiche d'un joueur", () => {
  it("n'existe pas pour un identifiant mal formé ou inconnu", async () => {
    await expect(renderPlayerPage("1")).rejects.toThrow("introuvable");
    expect(adminData.getPlayerDetail).not.toHaveBeenCalled();
    vi.mocked(adminData.getPlayerDetail).mockResolvedValueOnce(null);
    await expect(renderPlayerPage()).rejects.toThrow("introuvable");
    expect(notFound).toHaveBeenCalledTimes(2);
  });

  it("montre un joueur sans pseudo, jamais ouvert ni corrigé", async () => {
    vi.mocked(adminData.getPlayerDetail).mockResolvedValueOnce(
      await playerDetail(null),
    );
    await renderPlayerPage();
    expect(
      screen.getByRole("heading", { name: "Joueur sans pseudo" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Dernière ouverture : jamais/)).toBeInTheDocument();
    expect(screen.getByText("Aucune correction.")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Pseudo" }),
    ).not.toBeInTheDocument();
  });

  it("montre le pseudo à réinitialiser et l'historique signé", async () => {
    vi.mocked(adminData.getPlayerDetail).mockResolvedValueOnce({
      ...(await playerDetail("Ovalie")),
      openings: 3,
      lastOpeningAt: new Date("2026-10-20T10:00:00Z"),
      adjustments: [
        {
          id: BigInt(1),
          adminEmail: "admin@rugby-tcg.test",
          ingotsDelta: 50,
          boostersDelta: -1,
          reason: "Geste commercial",
          createdAt: new Date("2026-10-21T10:00:00Z"),
        },
      ],
    });
    await renderPlayerPage();
    expect(
      screen.getByRole("button", {
        name: "Réinitialiser le pseudo « Ovalie »",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("+50 lingots, -1 boosters")).toBeInTheDocument();
    expect(screen.queryByText(/jamais/)).not.toBeInTheDocument();
  });
});

describe("cadeaux", () => {
  it("classe chaque cadeau : en cours, à venir ou terminé", async () => {
    const now = Date.now();
    const giveaway = (id: string, startsAt: number, endsAt: number) => ({
      giveaway: {
        id,
        title: `Cadeau ${id}`,
        reward: { ingots: 100, boosters: 0 },
        startsAt,
        endsAt,
      },
      claims: 2,
      createdBy: "admin@rugby-tcg.test",
    });
    vi.mocked(adminData.listGiveaways).mockResolvedValueOnce([
      giveaway("a", now - HOUR_MS, now + HOUR_MS),
      giveaway("b", now + HOUR_MS, now + 2 * HOUR_MS),
      giveaway("c", now - 2 * HOUR_MS, now - HOUR_MS),
    ]);
    render(await AdminGiveawaysPage());
    const item = (title: string) =>
      within(screen.getByText(title).closest("li") as HTMLElement);
    expect(item("Cadeau a").getByText("· En cours")).toBeInTheDocument();
    expect(item("Cadeau a").getByRole("button")).toHaveTextContent("Arrêter");
    expect(item("Cadeau b").getByRole("button")).toHaveTextContent("Annuler");
    expect(item("Cadeau c").getByText("· Terminé")).toBeInTheDocument();
    expect(item("Cadeau c").queryByRole("button")).not.toBeInTheDocument();
  });

  it("annonce l'absence de cadeau", async () => {
    vi.mocked(adminData.listGiveaways).mockResolvedValueOnce([]);
    render(await AdminGiveawaysPage());
    expect(screen.getByText("Aucun cadeau programmé.")).toBeInTheDocument();
  });
});

describe("saisons", () => {
  it("classe chaque saison : en cours, à venir ou terminée", async () => {
    const now = Date.now();
    const season = (id: string, startsAt: number, endsAt: number) => ({
      season: { id, title: `Saison ${id}`, startsAt, endsAt },
      passes: 1,
      createdBy: "admin@rugby-tcg.test",
    });
    vi.mocked(adminData.listSeasons).mockResolvedValueOnce([
      season("a", now - HOUR_MS, now + HOUR_MS),
      season("b", now + HOUR_MS, now + 2 * HOUR_MS),
      season("c", now - 2 * HOUR_MS, now - HOUR_MS),
    ]);
    render(await AdminSeasonsPage());
    const item = (title: string) =>
      within(screen.getByText(title).closest("li") as HTMLElement);
    expect(item("Saison a").getByRole("button")).toHaveTextContent("Arrêter");
    expect(item("Saison b").getByRole("button")).toHaveTextContent("Annuler");
    expect(item("Saison c").getByText("· Terminée")).toBeInTheDocument();
    expect(item("Saison c").queryByRole("button")).not.toBeInTheDocument();
  });

  it("annonce l'absence de saison", async () => {
    vi.mocked(adminData.listSeasons).mockResolvedValueOnce([]);
    render(await AdminSeasonsPage());
    expect(screen.getByText("Aucune saison programmée.")).toBeInTheDocument();
  });
});
