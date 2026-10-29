import {
  BoosterQuotaExceededError,
  CosmeticUnavailableError,
  InsufficientIngotsError,
  RewardNotClaimableError,
  UsernameTakenError,
} from "@/domain";
import { RateLimitedError } from "./action-result";

/** Message affiché au joueur pour l'échec d'une action du jeu. */
export function gameErrorMessage(error: unknown): string {
  if (error instanceof UsernameTakenError)
    return "Ce pseudo est déjà pris. Choisissez-en un autre.";
  if (error instanceof RateLimitedError)
    return "Doucement : réessayez dans quelques secondes.";
  if (error instanceof BoosterQuotaExceededError)
    return "Plus de booster disponible pour le moment.";
  if (error instanceof InsufficientIngotsError) return "Pas assez de lingots.";
  if (error instanceof RewardNotClaimableError)
    return "Cette récompense n'est plus disponible.";
  if (error instanceof CosmeticUnavailableError)
    return "Ce cosmétique n'est pas disponible.";
  return "Une erreur est survenue. Réessayez dans un instant.";
}
