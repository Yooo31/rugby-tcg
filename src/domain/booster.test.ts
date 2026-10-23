import { createSeededRng } from "@/lib/rng";
import { makeClubs, sequenceRng } from "@/test/fixtures";
import {
  BOOSTER_REFILL_MS,
  BOOSTER_SIZE,
  BoosterQuotaExceededError,
  drawBooster,
  freeBoosters,
  MAX_FREE_BOOSTERS,
  PREMIUM_MAX_FREE_BOOSTERS,
  nextFreeBoosterAt,
  RARITY_ODDS,
  rollRarity,
  takeFreeBooster,
} from "./booster";

describe("rollRarity", () => {
  it.each([
    [0, "common"],
    [0.69, "common"],
    [0.7, "rare"],
    [0.91, "rare"],
    [0.92, "epic"],
    [0.985, "epic"],
    [0.99, "legendary"],
    [0.999, "legendary"],
  ] as const)("renvoie pour un tirage de %f la rareté %s", (roll, expected) => {
    expect(rollRarity(() => roll)).toBe(expected);
  });

  it("a des probabilités dont la somme vaut 1", () => {
    const total = Object.values(RARITY_ODDS).reduce(
      (sum, odds) => sum + odds,
      0,
    );
    expect(total).toBeCloseTo(1);
  });

  it("respecte la distribution sur un grand nombre de tirages", () => {
    const rng = createSeededRng(42);
    const draws = 20_000;
    let legendary = 0;
    let common = 0;
    for (let index = 0; index < draws; index += 1) {
      const rarity = rollRarity(rng);
      if (rarity === "legendary") legendary += 1;
      if (rarity === "common") common += 1;
    }
    expect(common / draws).toBeCloseTo(RARITY_ODDS.common, 1);
    expect(legendary / draws).toBeCloseTo(RARITY_ODDS.legendary, 2);
  });
});

describe("drawBooster", () => {
  it("tire 5 clubs tous différents", () => {
    const cards = drawBooster(makeClubs(8), createSeededRng(7));
    expect(cards).toHaveLength(BOOSTER_SIZE);
    expect(new Set(cards.map((card) => card.clubId)).size).toBe(BOOSTER_SIZE);
  });

  it("est déterministe pour une graine donnée", () => {
    const clubs = makeClubs(20);
    expect(drawBooster(clubs, createSeededRng(3))).toEqual(
      drawBooster(clubs, createSeededRng(3)),
    );
  });

  it("tire la rareté indépendamment de la division du club", () => {
    // Deux valeurs par carte : choix du club (0 → le premier), puis rareté (0.995 → légendaire).
    const cards = drawBooster(
      makeClubs(5, "regionale3"),
      sequenceRng([0, 0.995]),
    );
    expect(cards.every((card) => card.rarity === "legendary")).toBe(true);
  });

  it("refuse un jeu de clubs trop petit", () => {
    expect(() => drawBooster(makeClubs(4), Math.random)).toThrow(
      /au moins 5 clubs/,
    );
  });
});

describe("réserve de boosters gratuits", () => {
  const start = Date.UTC(2026, 9, 13, 9, 0, 0);
  const afterRefills = (count: number) => start + count * BOOSTER_REFILL_MS;

  it("est pleine pour un nouveau joueur, sans compte à rebours", () => {
    expect(freeBoosters(null, start)).toBe(MAX_FREE_BOOSTERS);
    expect(nextFreeBoosterAt(null, start)).toBeNull();
  });

  it("se vide à chaque ouverture puis bloque", () => {
    let reserve = takeFreeBooster(null, start);
    while (reserve.count > 0) reserve = takeFreeBooster(reserve, start);
    expect(freeBoosters(reserve, start)).toBe(0);
    expect(() => takeFreeBooster(reserve, start)).toThrow(
      BoosterQuotaExceededError,
    );
  });

  it("rend un booster toutes les 8 heures, à partir de la première ouverture", () => {
    const reserve = { count: 0, since: start };
    expect(nextFreeBoosterAt(reserve, start)).toBe(afterRefills(1));
    expect(freeBoosters(reserve, afterRefills(1) - 1)).toBe(0);
    expect(freeBoosters(reserve, afterRefills(1))).toBe(1);
    expect(nextFreeBoosterAt(reserve, afterRefills(1))).toBe(afterRefills(2));
    expect(freeBoosters(reserve, afterRefills(2))).toBe(2);
  });

  it("ne dépasse jamais le plafond, même après une longue absence", () => {
    const reserve = { count: 1, since: start };
    expect(freeBoosters(reserve, afterRefills(50))).toBe(MAX_FREE_BOOSTERS);
    expect(nextFreeBoosterAt(reserve, afterRefills(50))).toBeNull();
  });

  it("lance le compte à rebours à la première ouverture d'une réserve pleine", () => {
    const later = afterRefills(50);
    expect(
      takeFreeBooster({ count: MAX_FREE_BOOSTERS, since: start }, later),
    ).toEqual({
      count: MAX_FREE_BOOSTERS - 1,
      since: later,
    });
  });

  it("conserve le temps déjà attendu quand on ouvre en cours de recharge", () => {
    // Vide à `start` ; une heure après le premier retour, on ouvre ce booster.
    const oneHourIntoSecondRefill = afterRefills(1) + 60 * 60 * 1000;
    const reserve = takeFreeBooster(
      { count: 0, since: start },
      oneHourIntoSecondRefill,
    );
    expect(reserve).toEqual({ count: 0, since: afterRefills(1) });
    expect(nextFreeBoosterAt(reserve, oneHourIntoSecondRefill)).toBe(
      afterRefills(2),
    );
  });

  it("donne au plus 3 boosters gratuits par jour", () => {
    const day = 24 * 60 * 60 * 1000;
    expect(MAX_FREE_BOOSTERS).toBe(3);
    expect(Math.floor(day / BOOSTER_REFILL_MS)).toBe(3);
  });

  it("accepte une réserve plus grande pour le premium", () => {
    const reserve = { count: 0, since: start };
    expect(freeBoosters(null, start, PREMIUM_MAX_FREE_BOOSTERS)).toBe(5);
    expect(
      freeBoosters(reserve, afterRefills(50), PREMIUM_MAX_FREE_BOOSTERS),
    ).toBe(5);
    expect(
      nextFreeBoosterAt(reserve, afterRefills(4), PREMIUM_MAX_FREE_BOOSTERS),
    ).toBe(afterRefills(5));
    expect(
      takeFreeBooster(
        { count: 5, since: start },
        start,
        PREMIUM_MAX_FREE_BOOSTERS,
      ),
    ).toEqual({ count: 4, since: start });
  });

  it("ignore une horloge qui recule", () => {
    expect(freeBoosters({ count: 1, since: start }, start - 10_000)).toBe(1);
  });
});
