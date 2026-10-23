import {
  BoosterQuotaExceededError,
  InsufficientIngotsError,
  RewardNotClaimableError,
  UsernameTakenError,
} from "@/domain";
import { RateLimitedError } from "./action-result";
import { gameErrorMessage } from "./messages";

describe("messages d'erreur du jeu", () => {
  it("explique chaque refus prévu", () => {
    expect(gameErrorMessage(new UsernameTakenError())).toMatch(/déjà pris/);
    expect(gameErrorMessage(new RateLimitedError())).toMatch(/Doucement/);
    expect(gameErrorMessage(new BoosterQuotaExceededError())).toMatch(
      /booster/,
    );
    expect(gameErrorMessage(new InsufficientIngotsError())).toMatch(/lingots/);
    expect(gameErrorMessage(new RewardNotClaimableError())).toMatch(
      /récompense/,
    );
  });

  it("reste vague sur une panne", () => {
    expect(gameErrorMessage(new Error("connexion refusée"))).not.toMatch(
      /connexion/,
    );
  });
});
