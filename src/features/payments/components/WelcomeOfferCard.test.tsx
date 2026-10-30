import { render, screen } from "@testing-library/react";
import { WelcomeOfferCard } from "./WelcomeOfferCard";

describe("WelcomeOfferCard", () => {
  it("propose l'offre tant qu'elle n'a pas été prise", () => {
    const { rerender } = render(<WelcomeOfferCard isAvailable />);
    expect(
      screen.getByRole("heading", { name: "Offre de bienvenue" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Acheter Offre de bienvenue : 500 lingots et 7 jours de VIP/,
      }),
    ).toBeInTheDocument();
    rerender(<WelcomeOfferCard isAvailable={false} />);
    expect(
      screen.queryByRole("heading", { name: "Offre de bienvenue" }),
    ).not.toBeInTheDocument();
  });
});
