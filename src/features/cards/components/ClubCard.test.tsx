import { render, screen } from "@testing-library/react";
import { RARITIES } from "@/domain";
import { makeClub } from "@/test/fixtures";
import { CardSlot, ClubCard } from "./ClubCard";

const club = makeClub({
  id: "stade-toulousain",
  name: "Stade Toulousain",
  city: "Toulouse",
  division: "top14",
  recentResults: ["W", "W", "L"],
});

describe("ClubCard", () => {
  it("présente le club, sa division, sa puissance et sa forme", () => {
    render(<ClubCard club={club} rarity="common" />);

    expect(
      screen.getByRole("heading", { name: "Stade Toulousain" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Top 14")).toBeInTheDocument();
    expect(screen.getByText("Toulouse · Haute-Garonne")).toBeInTheDocument();
    expect(screen.getByText("88")).toBeInTheDocument();
    expect(
      screen.getByRole("list", {
        name: "Forme récente : victoire, victoire, défaite",
      }),
    ).toBeInTheDocument();
  });

  it.each(RARITIES)(
    "affiche la rareté $label sans changer la puissance",
    ({ id, label }) => {
      render(<ClubCard club={club} rarity={id} />);

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("data-rarity", id);
      expect(card).toHaveAccessibleName(
        `Stade Toulousain, Top 14, puissance 88, carte ${label.toLowerCase()}`,
      );
    },
  );
});

describe("CardSlot", () => {
  it("annonce une carte manquante", () => {
    render(<CardSlot club={club} />);
    expect(
      screen.getByRole("article", {
        name: "Stade Toulousain, carte manquante",
      }),
    ).toBeInTheDocument();
  });
});
