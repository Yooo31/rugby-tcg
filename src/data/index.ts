import { CATALOG_ALBUMS, CLUB_CATALOG } from "./catalog";
import { createMockRepositories } from "./mock/repositories";
import { createMemoryStore } from "./mock/storage";
import type { Season, VipMembership } from "@/domain";
import type { Rng } from "@/lib/rng";
import type { Repositories } from "./repositories";

export { CATALOG_SEASON } from "./catalog";
export type {
  BoosterOpening,
  LeaderboardRepository,
  PlayerRepository,
  Repositories,
} from "./repositories";

/**
 * Clubs et albums du jeu, identiques pour tous les joueurs. Ils viennent du
 * catalogue versionné : aucun aller-retour au serveur pour les afficher.
 *
 * L'état du joueur, lui, est arbitré côté serveur : voir `@/data/server`,
 * branché par les actions de `@/features/game`.
 */
export function createCatalogRepositories(): Pick<
  Repositories,
  "clubs" | "albums"
> {
  return {
    clubs: { list: async () => [...CLUB_CATALOG] },
    albums: { list: async () => [...CATALOG_ALBUMS] },
  };
}

/** Dépôts sans persistance, au tirage reproductible si `rng` est fourni : pour les tests. */
export function createInMemoryRepositories(
  rng?: Rng,
  options: {
    readonly season?: Season | null;
    readonly now?: () => Date;
    readonly vipMemberships?: readonly VipMembership[];
  } = {},
): Repositories {
  return createMockRepositories({
    store: createMemoryStore(),
    rng,
    ...options,
  });
}
