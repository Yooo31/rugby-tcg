import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { makeClub } from "@/test/fixtures";
import { CardDialog } from "./CardDialog";

const club = makeClub({
  id: "stade-toulousain",
  name: "Stade Toulousain",
  division: "top14",
});

describe("CardDialog", () => {
  it("montre la carte en grand avec la fiche du club, et se ferme", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <CardDialog
        selection={{ club, rarity: "epic", copies: { epic: 2 } }}
        onClose={onClose}
      />,
    );
    const dialog = screen.getByRole("dialog", {
      name: "Carte Stade Toulousain",
    });
    expect(dialog).toHaveTextContent("Top 14");
    expect(
      screen.getByRole("button", { name: "Partager en story" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("montre les quatre raretés : obtenues avec leurs exemplaires, les autres grisées", async () => {
    const user = userEvent.setup();
    render(
      <CardDialog
        selection={{ club, rarity: "epic", copies: { common: 3, epic: 1 } }}
        onClose={vi.fn()}
      />,
    );
    const rarities = within(
      screen.getByRole("list", { name: "Raretés de ce club" }),
    );
    const common = rarities.getByRole("button", {
      name: "Commune, 3 exemplaires",
    });
    const epic = rarities.getByRole("button", { name: "Épique, 1 exemplaire" });
    expect(epic).toHaveAttribute("aria-pressed", "true");
    expect(common).toHaveAttribute("aria-pressed", "false");
    expect(
      rarities.getByRole("img", { name: "Rare, pas encore obtenue" }),
    ).toBeInTheDocument();
    expect(
      rarities.getByRole("img", { name: "Légendaire, pas encore obtenue" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("article")).toHaveAttribute("data-rarity", "epic");

    await user.click(common);
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-rarity",
      "common",
    );
    expect(common).toHaveAttribute("aria-pressed", "true");
  });

  it("repart de la rareté demandée à chaque carte ouverte", async () => {
    const user = userEvent.setup();
    const { rerender } = render(
      <CardDialog
        selection={{ club, rarity: "epic", copies: { common: 1, epic: 1 } }}
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /^Commune/ }));
    const other = makeClub({ id: "pau", name: "Section Paloise" });
    rerender(
      <CardDialog
        selection={{ club: other, rarity: "epic", copies: { epic: 1 } }}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByRole("article")).toHaveAttribute("data-rarity", "epic");
  });

  it("ne montre rien sans carte choisie", () => {
    render(<CardDialog selection={null} onClose={vi.fn()} />);
    expect(screen.queryByText("Partager en story")).not.toBeInTheDocument();
  });
});
