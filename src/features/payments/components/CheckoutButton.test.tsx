import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { startCheckout } from "../server/actions";
import { CheckoutButton } from "./CheckoutButton";

describe("CheckoutButton", () => {
  it("exige la renonciation avant d'ouvrir le paiement, et dit pourquoi il échoue", async () => {
    const user = userEvent.setup();
    render(<CheckoutButton product={{ kind: "vip", id: "vip-month" }} />);
    await user.click(
      screen.getByRole("button", { name: /Acheter Pass VIP, un mois/ }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Acheter : Pass VIP, un mois",
    });
    const pay = within(dialog).getByRole("button", { name: /^Payer/ });
    expect(pay).toBeDisabled();

    await user.click(
      within(dialog).getByLabelText(/je renonce à mon droit de rétractation/),
    );
    await user.click(pay);
    expect(startCheckout).toHaveBeenCalledWith(
      { kind: "vip", id: "vip-month" },
      true,
    );
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Le paiement n'est pas disponible pour le moment.",
    );
  });

  it("débloque le bouton quand le joueur revient de Stripe par « Précédent »", async () => {
    const user = userEvent.setup();
    vi.mocked(startCheckout).mockResolvedValueOnce({
      ok: true,
      url: "https://checkout.stripe.com/c/pay/cs_test_1",
    });
    const assign = vi.fn();
    vi.spyOn(window, "location", "get").mockReturnValue({
      ...window.location,
      assign,
    });
    render(<CheckoutButton product={{ kind: "ingots", id: "bag" }} />);
    await user.click(
      screen.getByRole("button", { name: /Acheter 650 lingots/ }),
    );
    const dialog = screen.getByRole("dialog", {
      name: "Acheter : 650 lingots",
    });
    await user.click(
      within(dialog).getByLabelText(/je renonce à mon droit de rétractation/),
    );
    await user.click(within(dialog).getByRole("button", { name: /^Payer/ }));
    expect(assign).toHaveBeenCalledWith(
      "https://checkout.stripe.com/c/pay/cs_test_1",
    );
    expect(
      within(dialog).getByRole("button", { name: "Ouverture du paiement…" }),
    ).toBeDisabled();

    const restored = new Event("pageshow") as PageTransitionEvent;
    Object.defineProperty(restored, "persisted", { value: true });
    act(() => {
      window.dispatchEvent(restored);
    });
    expect(
      within(dialog).getByRole("button", { name: /^Payer/ }),
    ).toBeEnabled();
  });
});
