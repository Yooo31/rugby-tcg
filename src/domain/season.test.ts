import { RewardNotClaimableError } from "./reward";
import {
  claimSeasonTier,
  gainSeasonXp,
  reachedTier,
  SEASON_TIERS,
  SEASON_XP_PER_TIER,
  seasonLogFor,
  seasonProgress,
  tierRewards,
  type Season,
} from "./season";

const DAY_MS = 24 * 60 * 60 * 1000;
const start = Date.UTC(2026, 10, 1);
const season: Season = {
  id: "s1",
  title: "Saison d'automne",
  startsAt: start,
  endsAt: start + 56 * DAY_MS,
};
const during = start + DAY_MS;

describe("passe de saison", () => {
  it("compte les paliers atteints, sans dépasser le dernier", () => {
    expect(reachedTier(0)).toBe(0);
    expect(reachedTier(SEASON_XP_PER_TIER - 1)).toBe(0);
    expect(reachedTier(SEASON_XP_PER_TIER * 3)).toBe(3);
    expect(reachedTier(SEASON_XP_PER_TIER * 99)).toBe(SEASON_TIERS);
  });

  it("donne des boosters à intervalles réguliers, et plus au dernier palier", () => {
    expect(tierRewards(1)).toEqual({
      free: { ingots: 25, boosters: 0 },
      premium: { ingots: 50, boosters: 0 },
    });
    expect(tierRewards(3).premium.boosters).toBe(1);
    expect(tierRewards(5).free.boosters).toBe(1);
    expect(tierRewards(SEASON_TIERS)).toEqual({
      free: { ingots: 25, boosters: 3 },
      premium: { ingots: 50, boosters: 3 },
    });
  });

  it("n'accorde des points que pendant la saison, et repart de zéro à la suivante", () => {
    expect(gainSeasonXp(null, season, 10, during)).toEqual({
      seasonId: "s1",
      xp: 10,
      claimedFree: [],
      claimedPremium: [],
    });
    expect(gainSeasonXp(null, season, 10, season.endsAt)).toBeNull();
    expect(gainSeasonXp(null, null, 10, during)).toBeNull();
    const old = {
      seasonId: "s0",
      xp: 900,
      claimedFree: [1],
      claimedPremium: [],
    };
    expect(seasonLogFor(old, season).xp).toBe(0);
  });

  it("ouvre la voie gratuite à tous, la voie payante aux seuls détenteurs du passe", () => {
    const log = {
      seasonId: "s1",
      xp: SEASON_XP_PER_TIER * 2 + 50,
      claimedFree: [1],
      claimedPremium: [],
    };
    const free = seasonProgress(season, log, false, during);
    expect(free).toMatchObject({
      tier: 2,
      xpToNextTier: 150,
      hasPremium: false,
    });
    expect(free?.tiers.slice(0, 3).map((t) => t.free.status)).toEqual([
      "claimed",
      "claimable",
      "locked",
    ]);
    expect(free?.tiers[1]?.premium.status).toBe("locked");
    const premium = seasonProgress(season, log, true, during);
    expect(premium?.tiers[1]?.premium.status).toBe("claimable");
    expect(seasonProgress(season, log, true, season.endsAt)).toBeNull();
  });

  it("annonce zéro point restant au dernier palier", () => {
    const log = {
      seasonId: "s1",
      xp: SEASON_XP_PER_TIER * SEASON_TIERS + 10,
      claimedFree: [],
      claimedPremium: [],
    };
    expect(seasonProgress(season, log, false, during)?.xpToNextTier).toBe(0);
  });

  it("récupère un palier atteint une seule fois, dans la bonne voie", () => {
    const log = {
      seasonId: "s1",
      xp: 400,
      claimedFree: [],
      claimedPremium: [],
    };
    const claimed = claimSeasonTier(season, log, true, 2, "premium", during);
    expect(claimed.reward).toEqual({ ingots: 50, boosters: 0 });
    expect(claimed.log.claimedPremium).toEqual([2]);
    expect(() =>
      claimSeasonTier(season, claimed.log, true, 2, "premium", during),
    ).toThrow(RewardNotClaimableError);
    expect(
      claimSeasonTier(season, log, false, 1, "free", during).log.claimedFree,
    ).toEqual([1]);
    expect(() =>
      claimSeasonTier(season, log, false, 1, "premium", during),
    ).toThrow(RewardNotClaimableError);
    expect(() =>
      claimSeasonTier(season, log, false, 3, "free", during),
    ).toThrow(RewardNotClaimableError);
    expect(() => claimSeasonTier(null, log, false, 1, "free", during)).toThrow(
      RewardNotClaimableError,
    );
  });
});
