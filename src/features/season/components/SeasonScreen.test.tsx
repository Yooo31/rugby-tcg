import { render, screen, within } from "@testing-library/react";
import { createInMemoryRepositories } from "@/data";
import { SEASON_TIERS, type Season } from "@/domain";
import { GameProvider } from "@/features/game";
import { SeasonScreen } from "./SeasonScreen";

const now = Date.now();
const season: Season = {
  id: "s1",
  title: "Saison d'automne",
  startsAt: now - 1000,
  endsAt: now + 7 * 24 * 60 * 60 * 1000,
};

async function renderSeason(current: Season | null) {
  const repositories = createInMemoryRepositories(undefined, {
    season: current,
  });
  await repositories.player.setUsername("Testeur");
  await repositories.player.openBooster();
  render(
    <GameProvider repositories={repositories}>
      <SeasonScreen />
    </GameProvider>,
  );
}

describe("SeasonScreen", () => {
  it("montre la saison, l'avancement et les trente paliers des deux voies", async () => {
    await renderSeason(season);
    expect(
      await screen.findByRole("heading", { name: "Saison d'automne" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: `Palier 0 / ${SEASON_TIERS}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/190 points avant le palier suivant/),
    ).toBeInTheDocument();
    const tiers = within(
      screen.getByRole("list", { name: "Paliers de la saison" }),
    ).getAllByRole("listitem");
    expect(tiers).toHaveLength(SEASON_TIERS);
    expect(
      screen.queryByRole("button", { name: /Récupérer/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Acheter Passe de saison, voie payante pour 5,99/,
      }),
    ).toBeInTheDocument();
  });

  it("annonce l'absence de saison", async () => {
    await renderSeason(null);
    expect(
      await screen.findByText("Pas de saison en cours"),
    ).toBeInTheDocument();
  });
});
