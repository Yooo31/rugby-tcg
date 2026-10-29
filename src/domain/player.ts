import type { Collection } from "./collection";
import type { CosmeticState } from "./cosmetic";
import type { GiveawayProgress } from "./giveaway";
import type { MissionProgress } from "./mission";
import type { SeasonProgress } from "./season";
import type { SpecialCollection } from "./special-card";
import type { StreakProgress } from "./streak";
import type { BoosterStock } from "./wallet";

/** Tout ce que le jeu sait d'un joueur à un instant donné. */
export interface PlayerSnapshot {
  /** Pseudo public ; `null` tant que le joueur ne l'a pas choisi. */
  readonly username: string | null;
  readonly collection: Collection;
  /** Cartes spéciales (hors clubs), à part de la collection. */
  readonly specialCards: SpecialCollection;
  readonly ingots: number;
  readonly boosters: BoosterStock;
  readonly missions: readonly MissionProgress[];
  /** Albums dont la récompense a déjà été récupérée. */
  readonly claimedAlbumIds: readonly string[];
  /** Cadeaux en cours, récupérés ou non. */
  readonly giveaways: readonly GiveawayProgress[];
  /** Série de connexion : la récompense du jour. */
  readonly streak: StreakProgress;
  /** Cosmétiques possédés et équipés. */
  readonly cosmetics: CosmeticState;
  /** Saison en cours et avancement du joueur ; `null` hors saison. */
  readonly season: SeasonProgress | null;
}
