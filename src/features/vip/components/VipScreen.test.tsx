import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createInMemoryRepositories } from "@/data";
import { GameProvider } from "@/features/game";
import { formatEuros } from "@/lib/money";
import { VipBoosterCard } from "./VipBoosterCard";
import { VipScreen } from "./VipScreen";
import { VipSettings } from "./VipSettings";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2026-11-15T10:00:00Z");

async function renderWith(
  ui: React.ReactNode,
  vipMemberships: { startsAt: number; endsAt: number }[] = [],
) {
  const repositories = createInMemoryRepositories(undefined, {
    now: () => now,
    vipMemberships,
  });
  await repositories.player.setUsername("Testeur");
  return render(<GameProvider repositories={repositories}>{ui}</GameProvider>);
}

describe("VipScreen", () => {
  it("présente les avantages et les deux offres, paiement pas encore ouvert", async () => {
    await renderWith(<VipScreen />);
    expect(
      await screen.findByRole("heading", { name: "Pas encore VIP" }),
    ).toBeInTheDocument();
    const offers = within(
      screen.getByRole("region", { name: "S'abonner" }),
    ).getAllByRole("article");
    expect(offers.map((offer) => offer.getAttribute("aria-label"))).toEqual([
      `Un mois de pass VIP pour ${formatEuros(599)}`,
      `Un an de pass VIP pour ${formatEuros(4_999)}`,
    ]);
    expect(within(offers[1]!).getByText("30 % d'économie")).toBeInTheDocument();
    for (const offer of offers)
      expect(within(offer).getByRole("button")).toBeDisabled();
    expect(
      screen.getByRole("row", { name: /Réserve de boosters gratuits 3 5/ }),
    ).toBeInTheDocument();
  });

  it("donne la date de fin d'un VIP", async () => {
    await renderWith(<VipScreen />, [
      { startsAt: now.getTime() - DAY_MS, endsAt: Date.UTC(2026, 11, 14, 12) },
    ]);
    expect(
      await screen.findByRole("heading", { name: "Vous êtes VIP" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Jusqu'au 14 décembre 2026.")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Prolonger" }),
    ).toBeInTheDocument();
  });
});

describe("VipSettings", () => {
  it("mène au pass VIP depuis le compte", async () => {
    await renderWith(<VipSettings />);
    expect(
      await screen.findByRole("link", { name: "Découvrir le pass VIP" }),
    ).toHaveAttribute("href", "/vip");
  });
});

describe("VipBoosterCard", () => {
  it("ne montre rien hors VIP", () => {
    const { container } = render(
      <VipBoosterCard
        vip={{ isActive: false, until: null, dailyBooster: "locked" }}
        onClaim={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("propose le booster du jour, puis l'annonce pour demain", async () => {
    const user = userEvent.setup();
    const onClaim = vi.fn(async () => undefined);
    const { rerender } = render(
      <VipBoosterCard
        vip={{ isActive: true, until: 1, dailyBooster: "claimable" }}
        onClaim={onClaim}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Récupérer" }));
    expect(onClaim).toHaveBeenCalled();
    rerender(
      <VipBoosterCard
        vip={{ isActive: true, until: 1, dailyBooster: "claimed" }}
        onClaim={onClaim}
      />,
    );
    expect(screen.getByText("Récupéré")).toBeInTheDocument();
  });
});
