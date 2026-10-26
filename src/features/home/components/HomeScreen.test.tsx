import { render, screen } from "@testing-library/react";
import { createInMemoryRepositories } from "@/data";
import { MAX_FREE_BOOSTERS } from "@/domain";
import { GameProvider } from "@/features/game";
import { createSeededRng } from "@/lib/rng";
import { HomeScreen } from "./HomeScreen";

async function renderHome(openings: number) {
  const repositories = createInMemoryRepositories(createSeededRng(4));
  await repositories.player.setUsername("Testeur");
  for (let index = 0; index < openings; index += 1)
    await repositories.player.openBooster();
  render(
    <GameProvider repositories={repositories}>
      <HomeScreen />
    </GameProvider>,
  );
}

describe("HomeScreen", () => {
  it("invite à ouvrir les boosters d'un nouveau joueur", async () => {
    await renderHome(0);
    expect(
      await screen.findByRole("heading", {
        name: `${MAX_FREE_BOOSTERS} boosters à ouvrir`,
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ouvrir" })).toHaveAttribute(
      "href",
      "/boosters",
    );
    expect(screen.queryByText("Dernières cartes")).not.toBeInTheDocument();
  });

  it("montre la réserve vide, les dernières cartes et les albums en cours", async () => {
    await renderHome(MAX_FREE_BOOSTERS);
    expect(
      await screen.findByRole("heading", { name: "Réserve vide" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ma collection" })).toHaveAttribute(
      "href",
      "/collection",
    );
    expect(
      screen.getByRole("heading", { name: "Dernières cartes" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Albums en cours" }),
    ).toBeInTheDocument();
  });
});
