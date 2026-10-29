import {
  BoosterQuotaExceededError,
  CosmeticUnavailableError,
  InsufficientIngotsError,
  RewardNotClaimableError,
  UsernameTakenError,
} from "@/domain";
import {
  gameErrorCode,
  InvalidGameRequestError,
  RateLimitedError,
  unwrap,
  type GameErrorCode,
} from "./action-result";

const REFUSALS: readonly [Error, GameErrorCode][] = [
  [new BoosterQuotaExceededError(), "booster-quota"],
  [new InsufficientIngotsError(), "insufficient-ingots"],
  [new RewardNotClaimableError(), "reward-not-claimable"],
  [new CosmeticUnavailableError(), "cosmetic-unavailable"],
  [new UsernameTakenError(), "username-taken"],
  [new RateLimitedError(), "rate-limited"],
  [new InvalidGameRequestError(), "invalid-request"],
];

describe("refus des actions du jeu", () => {
  it.each(REFUSALS)(
    "traduit %s en code, puis en la même erreur",
    (error, code) => {
      expect(gameErrorCode(error)).toBe(code);
      expect(() => unwrap({ ok: false, error: code })).toThrow(
        error.constructor as new () => Error,
      );
    },
  );

  it("laisse une panne inattendue rester une erreur", () => {
    expect(gameErrorCode(new Error("base injoignable"))).toBeNull();
  });

  it("rend la valeur d'un succès", () => {
    expect(unwrap({ ok: true, value: 42 })).toBe(42);
  });
});
