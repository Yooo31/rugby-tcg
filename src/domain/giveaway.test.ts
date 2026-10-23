import {
  claimGiveaway,
  giveawayProgress,
  giveawaySchema,
  isGiveawayActive,
  type Giveaway,
} from "./giveaway";
import { RewardNotClaimableError } from "./reward";

const start = Date.UTC(2026, 9, 22, 22, 0); // 23/10 à minuit, heure de Paris
const end = Date.UTC(2026, 9, 23, 22, 0);

const BOOSTER_DAY: Giveaway = {
  id: "booster-23-10",
  title: "Un booster offert",
  reward: { ingots: 0, boosters: 1 },
  startsAt: start,
  endsAt: end,
};

describe("cadeaux", () => {
  it("n'est actif que pendant sa période, début inclus et fin exclue", () => {
    expect(isGiveawayActive(BOOSTER_DAY, start - 1)).toBe(false);
    expect(isGiveawayActive(BOOSTER_DAY, start)).toBe(true);
    expect(isGiveawayActive(BOOSTER_DAY, end - 1)).toBe(true);
    expect(isGiveawayActive(BOOSTER_DAY, end)).toBe(false);
  });

  it("ne montre que les cadeaux en cours, avec leur état", () => {
    const later = {
      ...BOOSTER_DAY,
      id: "plus-tard",
      startsAt: end,
      endsAt: end + 1000,
    };
    expect(giveawayProgress([BOOSTER_DAY, later], [], start)).toEqual([
      { giveaway: BOOSTER_DAY, status: "claimable" },
    ]);
    expect(giveawayProgress([BOOSTER_DAY], ["booster-23-10"], start)).toEqual([
      { giveaway: BOOSTER_DAY, status: "claimed" },
    ]);
  });

  it("se récupère une fois, pendant la période", () => {
    expect(claimGiveaway([BOOSTER_DAY], BOOSTER_DAY.id, [], start)).toEqual({
      ingots: 0,
      boosters: 1,
    });
    for (const [claimed, now] of [
      [[BOOSTER_DAY.id], start],
      [[], end],
      [[], start - 1],
    ] as const) {
      expect(() =>
        claimGiveaway([BOOSTER_DAY], BOOSTER_DAY.id, claimed, now),
      ).toThrow(RewardNotClaimableError);
    }
    expect(() => claimGiveaway([BOOSTER_DAY], "inconnu", [], start)).toThrow(
      RewardNotClaimableError,
    );
  });

  it("refuse un cadeau vide", () => {
    expect(
      giveawaySchema.safeParse({
        ...BOOSTER_DAY,
        reward: { ingots: 0, boosters: 0 },
      }).success,
    ).toBe(false);
  });
});
