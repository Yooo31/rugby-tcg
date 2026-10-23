import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StreakCard } from "./StreakCard";

describe("StreakCard", () => {
  it("propose la récompense du jour", async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn(async () => undefined);
    render(
      <StreakCard
        streak={{
          day: 3,
          reward: { ingots: 30, boosters: 0 },
          status: "claimable",
        }}
        onClaim={onClaim}
      />,
    );
    expect(screen.getByRole("heading", { name: "Jour 3" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Récupérer" }));
    expect(onClaim).toHaveBeenCalled();
  });

  it("annonce le jour suivant une fois récupéré", () => {
    render(
      <StreakCard
        streak={{
          day: 6,
          reward: { ingots: 60, boosters: 0 },
          status: "claimed",
        }}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByText(/jour 7/)).toBeInTheDocument();
    expect(screen.getByText(/1 booster/)).toBeInTheDocument();
  });
});
