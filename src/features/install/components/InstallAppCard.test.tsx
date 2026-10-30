import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InstallAppCard } from "./InstallAppCard";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15";
const original = navigator.userAgent;

function setUserAgent(value: string) {
  Object.defineProperty(navigator, "userAgent", {
    value,
    configurable: true,
  });
}

afterEach(() => {
  setUserAgent(original);
  window.localStorage.clear();
});

describe("InstallAppCard", () => {
  it("explique l'installation sur iPhone, et se masque pour de bon", async () => {
    const user = userEvent.setup();
    setUserAgent(IPHONE);
    const { unmount } = render(<InstallAppCard dismissible />);
    expect(
      screen.getByRole("heading", { name: "Installer l'application" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sur l'écran d'accueil/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Plus tard" }));
    expect(
      screen.queryByRole("heading", { name: "Installer l'application" }),
    ).not.toBeInTheDocument();
    unmount();
    // Dans Compte, la carte reste proposée.
    render(<InstallAppCard />);
    expect(
      screen.getByRole("heading", { name: "Installer l'application" }),
    ).toBeInTheDocument();
  });

  it("ressort l'invite native du navigateur au clic", async () => {
    const user = userEvent.setup();
    render(<InstallAppCard />);
    expect(
      screen.queryByRole("heading", { name: "Installer l'application" }),
    ).not.toBeInTheDocument();

    const prompt = vi.fn(async () => undefined);
    const event = Object.assign(new Event("beforeinstallprompt"), {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    });
    act(() => {
      window.dispatchEvent(event);
    });
    await user.click(screen.getByRole("button", { name: "Installer" }));
    expect(prompt).toHaveBeenCalled();
    // Une invite ne sert qu'une fois.
    expect(
      screen.queryByRole("button", { name: "Installer" }),
    ).not.toBeInTheDocument();
  });

  it("ne propose rien une fois installée", () => {
    setUserAgent(IPHONE);
    render(<InstallAppCard />);
    act(() => {
      window.dispatchEvent(new Event("appinstalled"));
    });
    expect(
      screen.queryByRole("heading", { name: "Installer l'application" }),
    ).not.toBeInTheDocument();
  });
});
