import { render, screen } from "@testing-library/react";
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
        selection={{ club, rarity: "epic", count: 2 }}
        onClose={onClose}
      />,
    );
    const dialog = screen.getByRole("dialog", {
      name: "Carte Stade Toulousain",
    });
    expect(dialog).toHaveTextContent("Top 14");
    expect(dialog).toHaveTextContent("Épique");
    expect(dialog).toHaveTextContent("×2");
    expect(
      screen.getByRole("button", { name: "Partager en story" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("ne montre rien sans carte choisie", () => {
    render(<CardDialog selection={null} onClose={vi.fn()} />);
    expect(screen.queryByText("Partager en story")).not.toBeInTheDocument();
  });
});
