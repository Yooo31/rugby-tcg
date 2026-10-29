import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInMemoryRepositories, type Repositories } from "@/data";
import type { PlayerSnapshot } from "@/domain";
import { GameProvider } from "@/features/game";
import { CosmeticSettings } from "./CosmeticSettings";
import { ShopScreen } from "./ShopScreen";

/**
 * Joueur avec 300 lingots : le dépôt en mémoire part de zéro, on habille donc
 * ses réponses. Achat et équipement sont des doublures qui renvoient l'état.
 */
async function richPlayer() {
  const repositories = createInMemoryRepositories();
  const named = await repositories.player.setUsername("Testeur");
  const base: PlayerSnapshot = { ...named, ingots: 300 };
  const afterBuy: PlayerSnapshot = {
    ...base,
    ingots: 150,
    cosmetics: {
      ...base.cosmetics,
      owned: [...base.cosmetics.owned, "back-night"],
    },
  };
  const afterEquip: PlayerSnapshot = {
    ...afterBuy,
    cosmetics: {
      ...afterBuy.cosmetics,
      equipped: { ...afterBuy.cosmetics.equipped, "card-back": "back-night" },
    },
  };
  const buyCosmetic = vi.fn(async () => afterBuy);
  const equipCosmetic = vi.fn(async () => afterEquip);
  const stubbed: Repositories = {
    ...repositories,
    player: {
      ...repositories.player,
      get: async () => base,
      buyCosmetic,
      equipCosmetic,
    },
  };
  return { repositories: stubbed, buyCosmetic, equipCosmetic };
}

describe("cosmétiques en boutique", () => {
  it("achète un dos en lingots puis l'équipe", async () => {
    const user = userEvent.setup();
    const { repositories, buyCosmetic, equipCosmetic } = await richPlayer();
    render(
      <GameProvider repositories={repositories}>
        <ShopScreen />
      </GameProvider>,
    );
    const backs = await screen.findByRole("region", { name: "Dos de carte" });
    expect(
      within(backs).getByRole("button", { name: "Équipé" }),
    ).toBeDisabled();
    const night = within(backs).getByRole("article", { name: "Nuit au stade" });
    // En lingots seulement : aucun prix en euros.
    expect(within(night).queryByText(/€/)).not.toBeInTheDocument();
    await user.click(
      within(night).getByRole("button", {
        name: "Acheter Nuit au stade pour 150 lingots",
      }),
    );
    expect(buyCosmetic).toHaveBeenCalledWith("back-night");

    await user.click(
      await within(night).findByRole("button", { name: "Équiper" }),
    );
    expect(equipCosmetic).toHaveBeenCalledWith("back-night");
    expect(
      await within(night).findByRole("button", { name: "Équipé" }),
    ).toBeDisabled();
  });

  it("montre un cosmétique en grand, et l'achète depuis l'aperçu", async () => {
    const user = userEvent.setup();
    const { repositories, buyCosmetic } = await richPlayer();
    render(
      <GameProvider repositories={repositories}>
        <ShopScreen />
      </GameProvider>,
    );
    await user.click(
      await screen.findByRole("button", {
        name: "Voir en grand : Nuit au stade",
      }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Aperçu : Nuit au stade",
    });
    expect(dialog).toHaveTextContent("Dos de carte");
    await user.click(
      within(dialog).getByRole("button", {
        name: "Acheter Nuit au stade pour 150 lingots",
      }),
    );
    expect(buyCosmetic).toHaveBeenCalledWith("back-night");
    await user.click(within(dialog).getByRole("button", { name: "Fermer" }));
    expect(
      screen.queryByRole("dialog", { name: "Aperçu : Nuit au stade" }),
    ).not.toBeInTheDocument();
  });

  it("annonce les cosmétiques à gagner", async () => {
    const { repositories } = await richPlayer();
    render(
      <GameProvider repositories={repositories}>
        <ShopScreen />
      </GameProvider>,
    );
    expect(
      await screen.findByText("Offert pour 30 jours de série"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Offert pour un album terminé"),
    ).toBeInTheDocument();
  });
});

describe("cosmétiques sur la page Compte", () => {
  it("propose les cosmétiques possédés et équipe celui choisi", async () => {
    const user = userEvent.setup();
    const { repositories, equipCosmetic } = await richPlayer();
    render(
      <GameProvider repositories={repositories}>
        <CosmeticSettings />
      </GameProvider>,
    );
    const backs = await screen.findByRole("group", { name: "Dos de carte" });
    expect(
      within(backs).getByRole("button", { name: "Pelouse" }),
    ).toHaveAttribute("aria-pressed", "true");
    // Seul le dos de départ est possédé : c'est le seul proposé.
    expect(within(backs).getAllByRole("button")).toHaveLength(1);
    await user.click(within(backs).getByRole("button", { name: "Pelouse" }));
    expect(equipCosmetic).toHaveBeenCalledWith("back-pitch");
  });

  it("affiche le refus d'un équipement", async () => {
    const user = userEvent.setup();
    const { repositories, equipCosmetic } = await richPlayer();
    equipCosmetic.mockRejectedValueOnce(new Error("panne"));
    render(
      <GameProvider repositories={repositories}>
        <CosmeticSettings />
      </GameProvider>,
    );
    const frames = await screen.findByRole("group", {
      name: "Cadres de carte",
    });
    await user.click(within(frames).getByRole("button", { name: "Sobre" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Une erreur est survenue",
    );
  });
});
