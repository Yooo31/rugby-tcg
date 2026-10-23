import { render, screen } from "@testing-library/react";
import { NotificationsToggle } from "./NotificationsToggle";

describe("NotificationsToggle", () => {
  it("explique quand le navigateur ne permet pas les notifications", async () => {
    render(<NotificationsToggle />);
    expect(
      await screen.findByText(/ne permet pas les notifications/),
    ).toBeInTheDocument();
  });
});
