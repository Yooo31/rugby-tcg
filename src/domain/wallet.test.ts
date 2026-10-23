import {
  BOOSTER_REFILL_MS,
  BoosterQuotaExceededError,
  MAX_FREE_BOOSTERS,
} from "./booster";
import {
  BOOSTER_OFFERS,
  boosterStock,
  buyBoosters,
  canAfford,
  EMPTY_WALLET,
  grantReward,
  InsufficientIngotsError,
  offerDiscountPercent,
  spendBooster,
} from "./wallet";

const now = Date.UTC(2026, 9, 13, 9, 0, 0);
const empty = { count: 0, since: now };

describe("portefeuille", () => {
  it("crédite lingots et boosters d'une récompense", () => {
    const wallet = grantReward(
      { ingots: 10, bonusBoosters: 1 },
      { ingots: 40, boosters: 2 },
    );
    expect(wallet).toEqual({ ingots: 50, bonusBoosters: 3 });
  });

  it("vend un booster à 100 lingots et un lot de 10 à 900", () => {
    expect(buyBoosters({ ingots: 105, bonusBoosters: 0 }, "single")).toEqual({
      ingots: 5,
      bonusBoosters: 1,
    });
    expect(buyBoosters({ ingots: 900, bonusBoosters: 2 }, "pack")).toEqual({
      ingots: 0,
      bonusBoosters: 12,
    });
  });

  it("affiche 10 % de remise sur le lot, aucune à l'unité", () => {
    const [single, pack] = BOOSTER_OFFERS;
    expect(offerDiscountPercent(single)).toBe(0);
    expect(offerDiscountPercent(pack)).toBe(10);
  });

  it("refuse l'achat sans assez de lingots", () => {
    const [single, pack] = BOOSTER_OFFERS;
    const wallet = { ingots: 899, bonusBoosters: 0 };
    expect(canAfford(wallet, single)).toBe(true);
    expect(canAfford(wallet, pack)).toBe(false);
    expect(() => buyBoosters(wallet, "pack")).toThrow(InsufficientIngotsError);
  });
});

describe("stock de boosters", () => {
  it("réunit les gratuits, les bonus et l'heure du prochain gratuit", () => {
    expect(boosterStock(null, { ingots: 0, bonusBoosters: 2 }, now)).toEqual({
      free: MAX_FREE_BOOSTERS,
      max: MAX_FREE_BOOSTERS,
      bonus: 2,
      nextFreeAt: null,
    });
    expect(boosterStock(empty, EMPTY_WALLET, now)).toEqual({
      free: 0,
      max: MAX_FREE_BOOSTERS,
      bonus: 0,
      nextFreeAt: now + BOOSTER_REFILL_MS,
    });
  });

  it("tient compte d'une réserve plus grande (premium)", () => {
    expect(boosterStock(null, EMPTY_WALLET, now, 5)).toMatchObject({
      free: 5,
      max: 5,
    });
    expect(spendBooster(null, EMPTY_WALLET, now, 5).reserve).toEqual({
      count: 4,
      since: now,
    });
  });

  it("dépense d'abord un booster gratuit, en gardant les bonus", () => {
    const wallet = { ingots: 0, bonusBoosters: 2 };
    expect(spendBooster(null, wallet, now)).toEqual({
      reserve: { count: MAX_FREE_BOOSTERS - 1, since: now },
      wallet,
      source: "free",
    });
  });

  it("puise dans les bonus quand la réserve est vide, sans toucher au compte à rebours", () => {
    const spending = spendBooster(empty, { ingots: 7, bonusBoosters: 2 }, now);
    expect(spending).toEqual({
      reserve: empty,
      wallet: { ingots: 7, bonusBoosters: 1 },
      source: "bonus",
    });
  });

  it("refuse quand il ne reste aucun booster", () => {
    expect(() => spendBooster(empty, EMPTY_WALLET, now)).toThrow(
      BoosterQuotaExceededError,
    );
  });
});
