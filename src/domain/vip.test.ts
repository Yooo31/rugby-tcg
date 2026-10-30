import { BoosterQuotaExceededError } from "./booster";
import {
  extendVip,
  getVipOffer,
  takeVipBooster,
  VIP_BOOSTER_INTERVAL_MS,
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
    const next = extendVip([membership], now, 30);
    expect(vipUntil([membership, next], now)).toBe(next.endsAt);
    const later = { startsAt: now + 90 * DAY_MS, endsAt: now + 99 * DAY_MS };
    expect(vipUntil([membership, later], now)).toBe(membership.endsAt);
  });

  it("prolonge à partir de la fin de l'adhésion en cours, ou de maintenant", () => {
    expect(extendVip([], now, 30)).toEqual({
      startsAt: now,
      endsAt: now + 30 * DAY_MS,
    });
    expect(extendVip([membership], now, getVipOffer("vip-year").days)).toEqual({
      startsAt: membership.endsAt,
      endsAt: membership.endsAt + 365 * DAY_MS,
    });
  });

  it("ouvre un booster VIP toutes les 48 heures, jamais sans pass", () => {
    expect(vipStatus([], null, now).booster).toEqual({
      status: "locked",
      readyAt: null,
    });
    expect(vipStatus([membership], null, now)).toEqual({
      isActive: true,
      until: membership.endsAt,
      booster: { status: "ready", readyAt: null },
    });
    const opened = takeVipBooster([membership], null, now);
    expect(vipStatus([membership], opened, now + DAY_MS).booster).toEqual({
      status: "waiting",
      readyAt: now + VIP_BOOSTER_INTERVAL_MS,
    });
    expect(() => takeVipBooster([membership], opened, now + DAY_MS)).toThrow(
      BoosterQuotaExceededError,
    );
    expect(
      vipStatus([membership], opened, now + VIP_BOOSTER_INTERVAL_MS).booster
        .status,
    ).toBe("ready");
    expect(() => takeVipBooster([], null, now)).toThrow(
      BoosterQuotaExceededError,
    );
  });
});
