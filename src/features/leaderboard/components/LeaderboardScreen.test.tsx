import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInMemoryRepositories } from "@/data";
import { GameProvider } from "@/features/game";
import { createSeededRng } from "@/lib/rng";
import { LeaderboardScreen } from "./LeaderboardScreen";

async function renderScreen({ open }: { readonly open: boolean }) {
  const repositories = createInMemoryRepositories(createSeededRng(9));
  await repositories.player.setUsername("Testeur");
  if (open) await repositories.player.openBooster();
  render(
    <GameProvider repositories={repositories}>
      <LeaderboardScreen />
    </GameProvider>,
  );
  return repositories;
}

describe("LeaderboardScreen", () => {
  it("classe le joueur au nombre de clubs différents", async () => {
    await renderScreen({ open: true });
    const board = await screen.findByRole("list", { name: "Classement" });
    const row = within(board)
      .getByText(/Testeur/)
      .closest("li");
    expect(row).toHaveAttribute("aria-current", "true");
    expect(row).toHaveTextContent("5");
  });

  it("filtre par région et explique un classement vide", async () => {
    const user = userEvent.setup();
    await renderScreen({ open: false });
    expect(await screen.findByText("Terrain vide")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Région des clubs"), "occ");
    expect(
      await screen.findByText(/clubs de la région Occitanie/),
    ).toBeInTheDocument();
  });
});
