import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { GiveawayProgress } from "@/domain";
import { GiveawayBanner } from "./GiveawayBanner";

const giveaway = {
  id: "cadeau",
  title: "Un booster offert",
  reward: { ingots: 0, boosters: 1 },
  startsAt: 0,
  endsAt: 1,
};

describe("GiveawayBanner", () => {
  it("propose de récupérer un cadeau en cours", async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn(async () => undefined);
    const giveaways: GiveawayProgress[] = [{ giveaway, status: "claimable" }];
    render(<GiveawayBanner giveaways={giveaways} onClaim={onClaim} />);

    expect(screen.getByText("Un booster offert")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Récupérer" }));
    expect(onClaim).toHaveBeenCalledWith("cadeau");
  });

  it("indique un cadeau déjà récupéré, et ne montre rien sans cadeau", () => {
    const { rerender } = render(
      <GiveawayBanner
        giveaways={[{ giveaway, status: "claimed" }]}
        onClaim={vi.fn()}
      />,
    );
    expect(screen.getByText("Récupéré")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();

    rerender(<GiveawayBanner giveaways={[]} onClaim={vi.fn()} />);
    expect(screen.queryByText("Récupéré")).not.toBeInTheDocument();
  });
});

describe("récompense faite uniquement de boosters", () => {
  it("n'affiche pas « 0 lingot »", () => {
    render(
      <GiveawayBanner
        giveaways={[{ giveaway, status: "claimable" }]}
        onClaim={vi.fn()}
      />,
    );
    expect(
      screen.queryByText("lingot", { exact: false }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/1 booster/)).toBeInTheDocument();
  });
});
