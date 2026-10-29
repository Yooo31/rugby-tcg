import { render, screen } from "@testing-library/react";
import { createInMemoryRepositories } from "@/data";
import { GameProvider } from "@/features/game";
import { PaymentThanksScreen } from "./PaymentThanksScreen";

describe("PaymentThanksScreen", () => {
  it("remercie et relit l'état du joueur pendant que le crédit arrive", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const repositories = createInMemoryRepositories();
    await repositories.player.setUsername("Testeur");
    const get = vi.spyOn(repositories.player, "get");
    render(
      <GameProvider repositories={repositories}>
        <PaymentThanksScreen />
      </GameProvider>,
    );
    expect(
      await screen.findByRole("heading", { name: "Merci !" }),
    ).toBeInTheDocument();
    const before = get.mock.calls.length;
    await vi.advanceTimersByTimeAsync(3_000 * 6);
    expect(get.mock.calls.length - before).toBe(5);
    vi.useRealTimers();
  });
});
