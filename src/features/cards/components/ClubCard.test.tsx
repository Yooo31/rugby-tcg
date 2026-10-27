import { render, screen } from "@testing-library/react";
import { RARITIES } from "@/domain";
import { makeClub } from "@/test/fixtures";
import { CardSlot, ClubCard, RecentForm } from "./ClubCard";

const club = makeClub({
  id: "stade-toulousain",
  name: "Stade Toulousain",
  city: "Toulouse",
  division: "top14",
  recentResults: ["W", "W", "L"],
});

describe("ClubCard", () => {
  it("présente le club, sa division et sa puissance, sans la forme", () => {
    render(<ClubCard club={club} rarity="common" />);

    expect(
      screen.getByRole("heading", { name: "Stade Toulousain" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Top 14")).toBeInTheDocument();
    expect(screen.getByText("Toulouse · Haute-Garonne")).toBeInTheDocument();
    expect(screen.getByText("87")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });

  it.each(RARITIES)(
    "affiche la rareté $label sans changer la puissance",
    ({ id, label }) => {
      render(<ClubCard club={club} rarity={id} />);

      const card = screen.getByRole("article");
      expect(card).toHaveAttribute("data-rarity", id);
      expect(card).toHaveAccessibleName(
        `Stade Toulousain, Top 14, puissance 87, carte ${label.toLowerCase()}`,
      );
    },
  );
});

describe("RecentForm", () => {
  it("lit les derniers résultats", () => {
    render(<RecentForm results={["W", "D", "L"]} />);
    expect(
      screen.getByRole("list", {
        name: "Forme récente : victoire, nul, défaite",
      }),
    ).toHaveTextContent("VND");
  });

  it("annonce l'absence de résultat", () => {
    render(<RecentForm results={[]} />);
    expect(
      screen.getByRole("list", { name: "Aucun résultat récent" }),
    ).toBeInTheDocument();
  });
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
