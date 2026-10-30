import { render, screen } from "@testing-library/react";
import { createInMemoryRepositories } from "@/data";
import { GameProvider } from "./GameProvider";
import { GameShell } from "./GameShell";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

function renderShell() {
  render(
    <GameProvider repositories={createInMemoryRepositories()}>
      <GameShell>
        <p>Écran</p>
      </GameShell>
    </GameProvider>,
  );
}

describe("GameShell", () => {
  it("mène au classement depuis l'en-tête, sur toutes les pages", () => {
    renderShell();
    const link = screen.getByRole("link", { name: "Classement" });
    expect(link).toHaveAttribute("href", "/classement");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("signale le classement quand on y est", () => {
    pathname.current = "/classement";
    renderShell();
    expect(screen.getByRole("link", { name: "Classement" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
