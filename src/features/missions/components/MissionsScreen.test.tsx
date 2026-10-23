import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInMemoryRepositories } from "@/data";
import { GameProvider } from "@/features/game";
import { createSeededRng } from "@/lib/rng";
import { MissionsScreen } from "./MissionsScreen";

describe("MissionsScreen", () => {
  it("affiche les missions du jour et crédite les lingots à la récupération", async () => {
    const user = userEvent.setup();
    const repositories = createInMemoryRepositories(createSeededRng(3));
    await repositories.player.setUsername("Testeur");
    for (let opening = 0; opening < 3; opening += 1)
      await repositories.player.openBooster();
    const { missions } = await repositories.player.get();
    const done = missions.find((entry) => entry.status === "claimable");
    if (!done) throw new Error("Aucune mission terminée après 3 boosters.");

    render(
      <GameProvider repositories={repositories}>
        <MissionsScreen />
      </GameProvider>,
    );

    expect(await screen.findAllByRole("article")).toHaveLength(missions.length);
    const card = screen
      .getByRole("heading", { name: done.mission.title })
      .closest("article");
    if (!card) throw new Error("Carte de mission introuvable.");

    await user.click(within(card).getByRole("button", { name: "Récupérer" }));

    expect(
      await within(card).findByText("Récompense récupérée"),
    ).toBeInTheDocument();
    expect((await repositories.player.get()).ingots).toBeGreaterThanOrEqual(
      done.mission.reward.ingots,
    );
  });
});
