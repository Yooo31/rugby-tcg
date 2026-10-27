import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BOOSTER_SIZE } from "@/domain";
import { createInMemoryRepositories } from "@/data";
import { GameProvider } from "@/features/game";
import { CollectionScreen } from "./CollectionScreen";

/**
 * Aléa nul : chaque booster tire les mêmes premiers clubs, en commune, et la
 * carte spéciale (sa chance est franchie dès que l'aléa vaut 0).
 */
const sameDraw = () => 0;

describe("doublons dans la collection", () => {
  it("compte les doublons et affiche le nombre d'exemplaires", async () => {
    const repositories = createInMemoryRepositories(sameDraw);
    await repositories.player.setUsername("Testeur");
    await repositories.player.openBooster();
    await repositories.player.openBooster();
    render(
      <GameProvider repositories={repositories}>
        <CollectionScreen />
      </GameProvider>,
    );

    await screen.findByText("Doublons");
    const stat = (label: string) =>
      within(screen.getByText(label).parentElement as HTMLElement);
    expect(
      stat("Doublons").getByText(String(BOOSTER_SIZE)),
    ).toBeInTheDocument();
    expect(
      stat("Cartes").getByText(String(2 * BOOSTER_SIZE)),
    ).toBeInTheDocument();
    // Une pastille par club, plus celle de la carte spéciale.
    expect(screen.getAllByText("×2")).toHaveLength(BOOSTER_SIZE + 1);

    const special = within(
      screen.getByRole("region", { name: "Cartes spéciales" }),
    );
    expect(
      special.getByRole("article", {
        name: "Équipe de France, carte spéciale",
      }),
    ).toBeInTheDocument();
    expect(special.getByLabelText("2 exemplaires")).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(
      screen.getAllByRole("article", {
        name: /Top 14|Pro D2|Nationale|Fédérale/,
      })[0],
    );
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("×2")).toBeInTheDocument();
  });
});
