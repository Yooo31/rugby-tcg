import { render, screen, within } from "@testing-library/react";
import { createInMemoryRepositories } from "@/data";
import { GameProvider } from "@/features/game";
import { ShopScreen } from "./ShopScreen";

describe("ShopScreen", () => {
  it("présente les quatre paquets en euros, paiement pas encore ouvert", async () => {
    const repositories = createInMemoryRepositories();
    await repositories.player.setUsername("Testeur");
    render(
      <GameProvider repositories={repositories}>
        <ShopScreen />
      </GameProvider>,
    );
    const packs = within(
      await screen.findByRole("region", { name: "Lingots" }),
    ).getAllByRole("article");
    expect(packs.map((pack) => pack.getAttribute("aria-label"))).toEqual([
      "Poignée : 200 lingots pour 1,99 €",
      "Sac : 700 lingots pour 5,99 €",
      "Coffre : 1500 lingots pour 11,99 €",
      "Malle : 3600 lingots pour 24,99 €",
    ]);
    expect(
      within(packs[1]!).getByRole("button", { name: /Acheter 700 lingots/ }),
    ).toBeEnabled();
    expect(within(packs[1]!).getByText("+16 % de lingots")).toBeInTheDocument();
    expect(within(packs[3]!).getByText("Meilleure offre")).toBeInTheDocument();
    expect(
      within(packs[0]!).queryByText(/de lingots$/),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Échanger des lingots" }),
    ).toBeInTheDocument();
  });
});
