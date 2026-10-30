import { render, screen, within } from "@testing-library/react";
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
      screen.getByRole("region", { name: "Devenir VIP" }),
    ).getAllByRole("article");
    expect(offers.map((offer) => offer.getAttribute("aria-label"))).toEqual([
      `Un mois de pass VIP pour ${formatEuros(599)}`,
      `Un an de pass VIP pour ${formatEuros(4_999)}`,
    ]);
    expect(within(offers[1]!).getByText("30 % d'économie")).toBeInTheDocument();
    for (const offer of offers)
      expect(within(offer).getByRole("button")).toBeEnabled();
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
        vip={{
          isActive: false,
          until: null,
          booster: { status: "locked", readyAt: null },
        }}
        onReady={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("mène au booster VIP quand il est prêt, sinon compte les heures", () => {
    const { rerender } = render(
      <VipBoosterCard
        vip={{
          isActive: true,
          until: 1,
          booster: { status: "ready", readyAt: null },
        }}
        onReady={vi.fn()}
      />,
    );
    expect(screen.getByRole("link", { name: "Ouvrir" })).toHaveAttribute(
      "href",
      "/boosters",
    );
    rerender(
      <VipBoosterCard
        vip={{
          isActive: true,
          until: 1,
          booster: { status: "waiting", readyAt: Date.now() + 3_600_000 },
        }}
        onReady={vi.fn()}
      />,
    );
    expect(
      screen.queryByRole("link", { name: "Ouvrir" }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("timer")).toBeInTheDocument();
  });
});
