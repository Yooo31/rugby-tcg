import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInMemoryRepositories } from "@/data";
import { BOOSTER_SIZE, MAX_FREE_BOOSTERS } from "@/domain";
import { GameProvider } from "@/features/game";
import { createSeededRng } from "@/lib/rng";
import { BoosterScreen } from "./BoosterScreen";

async function renderScreen() {
  const repositories = createInMemoryRepositories(createSeededRng(5));
  await repositories.player.setUsername("Testeur");
  render(
    <GameProvider repositories={repositories}>
      <BoosterScreen />
    </GameProvider>,
  );
  return repositories;
}

describe("BoosterScreen", () => {
  it("ouvre un booster, révèle ses cartes puis les range dans la collection", async () => {
    const user = userEvent.setup();
    const repositories = await renderScreen();

    await user.click(
      await screen.findByRole("button", { name: "Ouvrir le booster" }),
    );
    expect(
      await screen.findByRole(
        "list",
        { name: `Carte 1 sur ${BOOSTER_SIZE}` },
        { timeout: 3000 },
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Tout révéler" }));

    expect(
      await screen.findByRole("heading", { name: "Essai transformé" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: `Ouvrir un autre (${MAX_FREE_BOOSTERS - 1})`,
      }),
    ).toBeInTheDocument();
    expect((await repositories.player.get()).collection).toHaveLength(
      BOOSTER_SIZE,
    );
  });
});
