import {
  boostersPerWeek,
  closestScenario,
  monthIndicators,
  SCENARIOS,
} from "./revenue";

describe("indicateurs de revenu", () => {
  it("calcule revenu net, conversion, revenu par joueur et départs VIP", () => {
    const indicators = monthIndicators({
      activePlayers: 200,
      payers: 5,
      ingotBuyers: 3,
      sales: [
        { count: 3, cents: 1_797 },
        { count: 2, cents: 1_198 },
      ],
      vipAtStart: 4,
      vipLost: 1,
    });
    // 29,95 € bruts, moins 1,5 % et 5 × 0,25 €.
    expect(indicators).toEqual({
      grossCents: 2_995,
      netCents: Math.round(2_995 * 0.985 - 125),
      purchases: 5,
      conversion: 0.025,
      ingotBuyersShare: 0.015,
      arpuCents: Math.round(Math.round(2_995 * 0.985 - 125) / 200),
      arppuCents: Math.round(Math.round(2_995 * 0.985 - 125) / 5),
      vipChurn: 0.25,
    });
  });

  it("ne divise jamais par zéro", () => {
    expect(
      monthIndicators({
        activePlayers: 0,
        payers: 0,
        ingotBuyers: 0,
        sales: [],
        vipAtStart: 0,
        vipLost: 0,
      }),
    ).toMatchObject({
      grossCents: 0,
      conversion: null,
      arpuCents: null,
      arppuCents: null,
      vipChurn: null,
    });
  });

  it("trouve le scénario le plus proche du revenu réel", () => {
    expect(closestScenario(null)).toBeNull();
    expect(closestScenario(3)?.id).toBe("prudent");
    expect(closestScenario(20)?.id).toBe("median");
    expect(closestScenario(80)?.id).toBe("favorable");
    expect(SCENARIOS.map(({ arpuCents }) => arpuCents)).toEqual([7, 22, 47]);
  });

  it("ramène les boosters des joueurs gratuits à la semaine", () => {
    expect(boostersPerWeek({ days: 28, openings: 400, players: 10 })).toBe(10);
    expect(boostersPerWeek({ days: 28, openings: 0, players: 0 })).toBeNull();
  });
});
