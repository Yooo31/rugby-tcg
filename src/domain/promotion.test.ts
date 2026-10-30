import {
  activePromotion,
  canSchedulePromotion,
  discountedCents,
  promotionSchema,
} from "./promotion";

const DAY_MS = 24 * 60 * 60 * 1000;
const now = Date.UTC(2026, 10, 1);
const promo = {
  id: "p1",
  title: "Week-end du Top 14",
  percentOff: 30,
  startsAt: now,
  endsAt: now + 3 * DAY_MS,
};

describe("promotions", () => {
  it("s'applique pendant sa période seulement", () => {
    expect(activePromotion([promo], now)).toBe(promo);
    expect(activePromotion([promo], now + 3 * DAY_MS)).toBeNull();
    expect(activePromotion([promo], now - 1)).toBeNull();
  });

  it("réduit le prix au centime près", () => {
    expect(discountedCents(599, 30)).toBe(419);
    expect(discountedCents(2_499, 50)).toBe(1_250);
    expect(discountedCents(1, 50)).toBe(1);
  });

  it("garde 30 jours sans promotion avant et après chacune", () => {
    const later = (days: number, length = 2) => ({
      startsAt: promo.endsAt + days * DAY_MS,
      endsAt: promo.endsAt + (days + length) * DAY_MS,
    });
    expect(canSchedulePromotion([promo], later(29), now)).toBe(false);
    expect(canSchedulePromotion([promo], later(30), now)).toBe(true);
    // Avant une promotion déjà programmée : même écart.
    expect(
      canSchedulePromotion(
        [promo],
        { startsAt: now - 40 * DAY_MS, endsAt: now - 29 * DAY_MS },
        now - 50 * DAY_MS,
      ),
    ).toBe(false);
    // Période vide ou déjà passée.
    expect(
      canSchedulePromotion([], { startsAt: now, endsAt: now }, now - 1),
    ).toBe(false);
    expect(
      canSchedulePromotion([], { startsAt: now - 2, endsAt: now - 1 }, now),
    ).toBe(false);
  });

  it("borne la réduction", () => {
    expect(
      promotionSchema.safeParse({ ...promo, percentOff: 60 }).success,
    ).toBe(false);
  });
});
