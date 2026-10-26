import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState, type ComponentProps } from "react";
import { AppShell } from "./AppShell";

vi.mock("next/navigation", () => ({ usePathname: () => "/boosters" }));
vi.mock("next/link", () => ({
  default: ({ href, onClick, children, ...props }: ComponentProps<"a">) => (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
      }}
    >
      {children}
    </a>
  ),
}));

/** Écran factice qui garde un état, comme le récapitulatif d'un booster. */
function Counter() {
  const [count, setCount] = useState(0);
  return (
    <button type="button" onClick={() => setCount(count + 1)}>
      Compteur {count}
    </button>
  );
}

describe("AppShell", () => {
  it("remet l'écran à zéro quand on touche l'onglet déjà ouvert", async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <Counter />
      </AppShell>,
    );
    await user.click(screen.getByRole("button", { name: "Compteur 0" }));
    expect(
      screen.getByRole("button", { name: "Compteur 1" }),
    ).toBeInTheDocument();

    // Onglet de la barre du bas (le dernier lien « Boosters » de la page).
    const tabs = screen.getAllByRole("link", { name: "Boosters" });
    await user.click(tabs[tabs.length - 1]);
    expect(
      screen.getByRole("button", { name: "Compteur 0" }),
    ).toBeInTheDocument();
  });

  it("garde l'écran quand on touche un autre onglet", async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <Counter />
      </AppShell>,
    );
    await user.click(screen.getByRole("button", { name: "Compteur 0" }));
    const tabs = screen.getAllByRole("link", { name: "Missions" });
    await user.click(tabs[tabs.length - 1]);
    expect(
      screen.getByRole("button", { name: "Compteur 1" }),
    ).toBeInTheDocument();
  });
});
