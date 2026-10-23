import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInMemoryRepositories } from "@/data";
import { GameGate } from "../GameGate";
import { GameProvider } from "../GameProvider";

function renderGate() {
  const repositories = createInMemoryRepositories();
  render(
    <GameProvider repositories={repositories}>
      <GameGate>{(game) => <p>Bienvenue {game.username}</p>}</GameGate>
    </GameProvider>,
  );
  return repositories;
}

describe("choix du pseudo", () => {
  it("demande un pseudo avant de jouer, puis laisse entrer", async () => {
    const user = userEvent.setup();
    const repositories = renderGate();

    const field = await screen.findByLabelText("Pseudo");
    await user.type(field, "Pilier_31");
    await user.click(
      screen.getByRole("button", { name: "Entrer sur le terrain" }),
    );

    expect(await screen.findByText("Bienvenue Pilier_31")).toBeInTheDocument();
    expect((await repositories.player.get()).username).toBe("Pilier_31");
  });

  it("explique un pseudo invalide sans appeler le serveur", async () => {
    const user = userEvent.setup();
    const repositories = renderGate();

    await user.type(await screen.findByLabelText("Pseudo"), "a b");
    await user.click(
      screen.getByRole("button", { name: "Entrer sur le terrain" }),
    );

    expect(
      await screen.findByText(/au moins 3 caractères|Lettres, chiffres/),
    ).toBeInTheDocument();
    expect((await repositories.player.get()).username).toBeNull();
  });
});
