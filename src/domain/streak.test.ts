import { RewardNotClaimableError } from "./reward";
import {
  claimStreak,
  EMPTY_STREAK,
  streakProgress,
  streakReward,
} from "./streak";

describe("série de connexion", () => {
  it("rapporte 10 lingots de plus chaque jour, 100 au plus, et un booster tous les 7 jours", () => {
    expect(streakReward(1)).toEqual({ ingots: 10, boosters: 0 });
    expect(streakReward(7)).toEqual({ ingots: 70, boosters: 1 });
    expect(streakReward(12)).toEqual({ ingots: 100, boosters: 0 });
    expect(streakReward(14)).toEqual({ ingots: 100, boosters: 1 });
  });

  it("commence au jour 1, continue le lendemain et repart à 1 après un jour manqué", () => {
    const first = claimStreak(EMPTY_STREAK, "2026-10-23");
    expect(first.streak).toEqual({ count: 1, lastDay: "2026-10-23" });

    expect(streakProgress(first.streak, "2026-10-24")).toMatchObject({
      day: 2,
      status: "claimable",
    });
    expect(streakProgress(first.streak, "2026-10-26")).toMatchObject({
      day: 1,
      status: "claimable",
    });
  });

  it("ne se récupère qu'une fois par jour", () => {
    const { streak } = claimStreak(
      { count: 4, lastDay: "2026-10-22" },
      "2026-10-23",
    );
    expect(streak.count).toBe(5);
    expect(streakProgress(streak, "2026-10-23")).toMatchObject({
      day: 5,
      status: "claimed",
    });
    expect(() => claimStreak(streak, "2026-10-23")).toThrow(
      RewardNotClaimableError,
    );
  });
});
