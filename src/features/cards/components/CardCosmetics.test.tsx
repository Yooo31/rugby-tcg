import { render, screen } from "@testing-library/react";
import { DEFAULT_EQUIPPED } from "@/domain";
import { makeClub } from "@/test/fixtures";
import { CardCosmeticsProvider } from "./CardCosmetics";
import { CardBack, ClubCard } from "./ClubCard";

const club = makeClub({ id: "pau", name: "Section Paloise" });

describe("cosmétiques des cartes", () => {
  it("sans fournisseur : dos de départ et aucun cadre", () => {
    const { container } = render(
      <>
        <CardBack />
        <ClubCard club={club} rarity="epic" />
      </>,
    );
    expect(container.querySelector("[data-back]")).toHaveAttribute(
      "data-back",
      "back-pitch",
    );
    expect(screen.getByRole("article")).not.toHaveAttribute("data-frame");
  });

  it("applique le dos et le cadre équipés, sans toucher à la rareté", () => {
    const { container } = render(
      <CardCosmeticsProvider
        equipped={{
          ...DEFAULT_EQUIPPED,
          "card-back": "back-leather",
          "card-frame": "frame-stitch",
        }}
      >
        <CardBack />
        <ClubCard club={club} rarity="epic" />
      </CardCosmeticsProvider>,
    );
    expect(container.querySelector("[data-back]")).toHaveAttribute(
      "data-back",
      "back-leather",
    );
    const card = screen.getByRole("article", { name: /carte épique/ });
    expect(card).toHaveAttribute("data-frame", "frame-stitch");
    expect(card).toHaveAttribute("data-rarity", "epic");
  });

  it("montre un autre cosmétique en aperçu, quel que soit l'équipé", () => {
    const { container } = render(
      <CardCosmeticsProvider
        equipped={{ ...DEFAULT_EQUIPPED, "card-frame": "frame-stitch" }}
      >
        <CardBack design="back-night" />
        <ClubCard club={club} rarity="rare" frame="frame-in-goal" />
      </CardCosmeticsProvider>,
    );
    expect(container.querySelector("[data-back]")).toHaveAttribute(
      "data-back",
      "back-night",
    );
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-frame",
      "frame-in-goal",
    );
  });
});
