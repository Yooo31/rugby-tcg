import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import { secureRng } from "@/lib/rng";
import { CATALOG_ALBUMS, CLUB_CATALOG } from "../catalog";
import { createPlayerRepository } from "../player/repository";
import type { PlayerRepository } from "../repositories";
import { activeGiveaways } from "./giveaways";
import { createPrismaPlayerStore } from "./prisma-store";
import { currentPromotion } from "./promotions";
import { activeSeason } from "./seasons";

/**
 * Règles du jeu branchées sur Postgres pour un joueur : catalogue versionné,
 * hasard cryptographique, heure du serveur, cadeaux et saison en cours.
 * `playerId` vient toujours de la session vérifiée (ou de l'administration).
 */
export function postgresPlayerRepository(
  prisma: PrismaClient,
  playerId: string,
): PlayerRepository {
  return createPlayerRepository({
    store: createPrismaPlayerStore(prisma, playerId),
    clubs: CLUB_CATALOG,
    albums: CATALOG_ALBUMS,
    rng: secureRng,
    now: () => new Date(),
    giveaways: () => activeGiveaways(prisma, new Date()),
    season: () => activeSeason(prisma, new Date()),
    promotion: () => currentPromotion(prisma, new Date()),
  });
}
