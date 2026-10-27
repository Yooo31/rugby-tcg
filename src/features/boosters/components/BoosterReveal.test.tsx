import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeClub } from "@/test/fixtures";
import { BoosterReveal } from "./BoosterReveal";

const club = makeClub({ id: "pau", name: "Section Paloise" });
const clubsById = new Map([[club.id, club]]);
const cards = [
  { clubId: "pau", rarity: "rare", isNewClub: true, isNewCard: true },
] as const;

describe("BoosterReveal", () => {
  it("révèle la carte spéciale en dernier, après les clubs", async () => {
    const user = userEvent.setup();
    const onDone = vi.fn();
    render(
      <BoosterReveal
        cards={cards}
        special={{ id: "equipe-de-france", isNew: true }}
        clubsById={clubsById}
        onDone={onDone}
      />,
    );
    expect(
      screen.getByRole("list", { name: "Carte 1 sur 2" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: /Section Paloise.*carte rare/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Carte suivante" }));
    expect(
      await screen.findByRole("article", {
        name: "Équipe de France, carte spéciale",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("Carte spéciale !")).toBeInTheDocument();
    expect(screen.getByText(/cent mille/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Voir le résumé" }));
    expect(onDone).toHaveBeenCalled();
  });

  it("annonce un exemplaire de plus d'une carte spéciale déjà possédée", async () => {
    const user = userEvent.setup();
    render(
      <BoosterReveal
        cards={cards}
        special={{ id: "equipe-de-france", isNew: false }}
        clubsById={clubsById}
        onDone={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Carte suivante" }));
    expect(
      await screen.findByText(/un exemplaire de plus/),
    ).toBeInTheDocument();
  });

  it("s'en tient aux clubs sans carte spéciale", () => {
    render(
      <BoosterReveal cards={cards} clubsById={clubsById} onDone={vi.fn()} />,
    );
    expect(
      screen.getByRole("list", { name: "Carte 1 sur 1" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Voir le résumé" }),
    ).toBeInTheDocument();
  });
});
