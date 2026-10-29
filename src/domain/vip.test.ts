import { RewardNotClaimableError } from "./reward";
import {
  claimVipBooster,
  VIP_MAX_FREE_BOOSTERS,
  VIP_OFFERS,
  vipStatus,
  vipUntil,
} from "./vip";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 10, 15, 12);
const membership = { startsAt: now - DAY_MS, endsAt: now + 29 * DAY_MS };

describe("pass VIP", () => {
  it("se vend au mois ou à l'année et porte la réserve à 5", () => {
    expect(VIP_OFFERS.map(({ priceCents }) => priceCents)).toEqual([
      599, 4_999,
    ]);
    expect(VIP_MAX_FREE_BOOSTERS).toBe(5);
  });

  it("vaut pendant une adhésion, et jusqu'à la plus lointaine qui se chevauche", () => {
    expect(vipUntil([], now)).toBeNull();
    expect(vipUntil([membership], now)).toBe(membership.endsAt);
    expect(vipUntil([membership], membership.endsAt)).toBeNull();
    const longer = { startsAt: now - 2 * DAY_MS, endsAt: now + 60 * DAY_MS };
    expect(vipUntil([membership, longer], now)).toBe(longer.endsAt);
  });

  it("offre un booster par jour à un VIP, à prendre le jour même", () => {
    expect(vipStatus([], null, "2026-11-15", now).dailyBooster).toBe("locked");
    expect(vipStatus([membership], null, "2026-11-15", now)).toEqual({
      isActive: true,
      until: membership.endsAt,
      dailyBooster: "claimable",
    });
    expect(
      vipStatus([membership], "2026-11-15", "2026-11-15", now).dailyBooster,
    ).toBe("claimed");
    expect(
      vipStatus([membership], "2026-11-14", "2026-11-15", now).dailyBooster,
    ).toBe("claimable");
  });

  it("récupère le booster une fois, et jamais sans VIP", () => {
    expect(claimVipBooster([membership], null, "2026-11-15", now)).toEqual({
      day: "2026-11-15",
      reward: { ingots: 0, boosters: 1 },
    });
    expect(() =>
      claimVipBooster([membership], "2026-11-15", "2026-11-15", now),
    ).toThrow(RewardNotClaimableError);
    expect(() => claimVipBooster([], null, "2026-11-15", now)).toThrow(
      RewardNotClaimableError,
    );
  });
});
