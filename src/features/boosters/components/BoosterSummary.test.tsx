import { render, screen } from "@testing-library/react";
import { makeClub } from "@/test/fixtures";
import { BoosterSummary } from "./BoosterSummary";

const club = makeClub({ id: "pau", name: "Section Paloise" });
const clubsById = new Map([[club.id, club]]);
const duplicate = {
  clubId: "pau",
  rarity: "common",
  isNewClub: false,
  isNewCard: false,
} as const;

function renderSummary(
  special: { readonly id: "equipe-de-france"; readonly isNew: boolean } | null,
  cards: readonly (typeof duplicate)[] = [duplicate],
) {
  render(
    <BoosterSummary
      cards={cards}
      special={special}
      clubsById={clubsById}
      remaining={0}
      onOpenAnother={vi.fn()}
      onBack={vi.fn()}
    />,
  );
}

describe("BoosterSummary", () => {
  it("annonce les doublons quand rien n'est nouveau", () => {
    renderSummary(null);
    expect(screen.getByText(/Que des doublons/)).toBeInTheDocument();
  });

  it("annonce une carte spéciale nouvelle, même parmi des doublons", () => {
    renderSummary({ id: "equipe-de-france", isNew: true });
    expect(screen.queryByText(/Que des doublons/)).not.toBeInTheDocument();
    expect(screen.getByText(/Une carte spéciale/)).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Équipe de France, carte spéciale" }),
    ).toBeInTheDocument();
  });

  it("ajoute la carte spéciale aux nouveaux clubs", () => {
    renderSummary({ id: "equipe-de-france", isNew: true }, [
      { ...duplicate, isNewClub: true, isNewCard: true },
    ] as never);
    expect(
      screen.getByText(/1 nouveau club .* Et une carte spéciale/),
    ).toBeInTheDocument();
  });

  it("montre une carte spéciale déjà possédée, sans la dire nouvelle", () => {
    renderSummary({ id: "equipe-de-france", isNew: false });
    expect(screen.getByText(/Que des doublons/)).toBeInTheDocument();
    expect(
      screen.getByRole("article", { name: "Équipe de France, carte spéciale" }),
    ).toBeInTheDocument();
  });
});
