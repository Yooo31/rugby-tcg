import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AlbumRewardPanel } from "./AlbumRewardPanel";

const reward = { ingots: 50, boosters: 1 };

describe("AlbumRewardPanel", () => {
  it("annonce la récompense d'un album incomplet", () => {
    render(
      <AlbumRewardPanel
        view={{ reward, status: "locked" }}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByText("Terminez l'album")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("propose de récupérer un album terminé", async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn(async () => undefined);
    render(
      <AlbumRewardPanel
        view={{ reward, status: "claimable" }}
        onClaim={onClaim}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Récupérer" }));
    expect(onClaim).toHaveBeenCalled();
  });

  it("indique une récompense déjà récupérée", () => {
    render(
      <AlbumRewardPanel
        view={{ reward, status: "claimed" }}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByText("Récupérée")).toBeInTheDocument();
  });
});
