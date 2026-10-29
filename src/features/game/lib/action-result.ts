import {
  BoosterQuotaExceededError,
  CosmeticUnavailableError,
  InsufficientIngotsError,
  RewardNotClaimableError,
  UsernameTakenError,
} from "@/domain";

/**
 * Refus prévus d'une action du joueur. En production, Next.js masque le
 * message des erreurs levées par une action serveur : les refus voyagent donc
 * sous forme de code, et redeviennent des erreurs du domaine côté navigateur.
 */
export type GameErrorCode =
  | "booster-quota"
  | "insufficient-ingots"
  | "reward-not-claimable"
  | "cosmetic-unavailable"
  | "username-taken"
  | "rate-limited"
  | "invalid-request";

export type ActionResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: GameErrorCode };

/** Trop d'actions en peu de temps : le joueur doit patienter un instant. */
export class RateLimitedError extends Error {
  constructor() {
    super("Doucement : réessayez dans quelques secondes.");
    this.name = "RateLimitedError";
  }
}

export class InvalidGameRequestError extends Error {
  constructor() {
    super("Requête invalide.");
    this.name = "InvalidGameRequestError";
  }
}

/** Code d'un refus prévu, ou `null` pour une panne (qui doit rester une erreur). */
export function gameErrorCode(error: unknown): GameErrorCode | null {
  if (error instanceof BoosterQuotaExceededError) return "booster-quota";
  if (error instanceof InsufficientIngotsError) return "insufficient-ingots";
  if (error instanceof RewardNotClaimableError) return "reward-not-claimable";
  if (error instanceof CosmeticUnavailableError) return "cosmetic-unavailable";
  if (error instanceof UsernameTakenError) return "username-taken";
  if (error instanceof RateLimitedError) return "rate-limited";
  if (error instanceof InvalidGameRequestError) return "invalid-request";
  return null;
}

function errorFromCode(code: GameErrorCode): Error {
  switch (code) {
    case "booster-quota":
      return new BoosterQuotaExceededError();
    case "insufficient-ingots":
      return new InsufficientIngotsError();
    case "reward-not-claimable":
      return new RewardNotClaimableError();
    case "cosmetic-unavailable":
      return new CosmeticUnavailableError();
    case "username-taken":
      return new UsernameTakenError();
    case "rate-limited":
      return new RateLimitedError();
    case "invalid-request":
      return new InvalidGameRequestError();
  }
}

/** Valeur d'un résultat, ou l'erreur du domaine correspondant au refus. */
export function unwrap<T>(result: ActionResult<T>): T {
  if (result.ok) return result.value;
  throw errorFromCode(result.error);
}
