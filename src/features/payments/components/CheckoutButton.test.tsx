import { render, screen, within } from "@testing-library/react";
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
});
