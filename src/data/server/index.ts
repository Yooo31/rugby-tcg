import "server-only";
import { prisma } from "@/lib/db";
import type { RateLimiter } from "@/lib/rate-limit";
import { secureRng } from "@/lib/rng";
import { CATALOG_ALBUMS, CLUB_CATALOG } from "../catalog";
import { createPlayerRepository } from "../player/repository";
import type { LeaderboardRepository, PlayerRepository } from "../repositories";
import { activeSeason } from "./seasons";
import { activeGiveaways } from "./giveaways";
import { createPrismaLeaderboard } from "./leaderboard";
import { createPostgresRateLimiter } from "./rate-limit";
import { referralCodeSchema, usernameSchema } from "@/domain";
import {
  createPrismaPlayerStore,
  ensurePlayerRow,
  isUniqueViolation,
} from "./prisma-store";

/**
 * Dépôt du joueur `playerId`, arbitré par le serveur : état en base, heure du
 * serveur, tirage cryptographique.
 *
 * `playerId` doit venir de la session vérifiée (`requireAuthUser`), jamais
 * d'une donnée envoyée par le navigateur.
 *
 * Les clubs viennent du catalogue versionné, le même qui remplit la table
 * `clubs` (`pnpm db:seed`) : après un `pnpm clubs:import`, relancer le seed.
 */
export function createServerPlayerRepository(
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
  });
}

/** Limite de débit partagée par toutes les instances du serveur. */
export function createServerRateLimiter(options: {
  readonly limit: number;
  readonly windowMs: number;
}): RateLimiter {
  return createPostgresRateLimiter(prisma, options);
}

/** Classement vu par le joueur `playerId` (venu de la session vérifiée). */
export function createServerLeaderboard(
  playerId: string,
): LeaderboardRepository {
  return createPrismaLeaderboard(prisma, playerId);
}

/**
 * Crée la ligne `players` d'un utilisateur à sa première venue (sans effet
 * ensuite). `desiredUsername`, choisi à l'inscription, devient son pseudo s'il
 * n'en a pas encore et que personne ne l'a pris entre-temps ; sinon le jeu le
 * lui redemandera.
 */
export async function ensurePlayer(
  playerId: string,
  signup: {
    readonly username?: string | null;
    readonly referralCode?: string | null;
  } = {},
): Promise<void> {
  const created = await ensurePlayerRow(prisma, playerId);
  // Le parrainage ne s'applique qu'à la création du joueur, jamais après coup.
  const code = referralCodeSchema.safeParse(signup.referralCode).data;
  if (created && code) await referral.applyReferral(prisma, playerId, code);

  const username = usernameSchema.safeParse(signup.username).data;
  if (!username) return;
  try {
    await prisma.player.updateMany({
      where: { id: playerId, username: null },
      data: { username },
    });
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
  }
}

/** Le pseudo est-il libre (sans tenir compte de la casse) ? */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const taken = await prisma.player.count({
    where: { username: { equals: username, mode: "insensitive" } },
  });
  return taken === 0;
}

// Administration : chaque appelant doit d'abord vérifier les droits
// (`requireAdmin` dans @/features/admin/server).
import * as admin from "./admin";

export const adminData = {
  searchPlayers: (query: string) => admin.searchPlayers(prisma, query),
  getPlayerDetail: (playerId: string) =>
    admin.getPlayerDetail(prisma, playerId),
  adjustPlayer: (
    playerId: string,
    adjustment: Parameters<typeof admin.adjustPlayer>[2],
    adminEmail: string,
  ) => admin.adjustPlayer(prisma, playerId, adjustment, adminEmail),
  gameStats: () => admin.gameStats(prisma, new Date()),
  catalogStatus: () => admin.catalogStatus(prisma),
  activityData: () => admin.activityData(prisma),
  resetUsername: (playerId: string) => admin.resetUsername(prisma, playerId),
  listGiveaways: () => admin.listGiveaways(prisma),
  createGiveaway: (giveaway: admin.NewGiveaway, adminEmail: string) =>
    admin.createGiveaway(prisma, giveaway, adminEmail),
  endGiveaway: (giveawayId: string) =>
    admin.endGiveaway(prisma, giveawayId, new Date()),
};

/** Suppression et export d'un compte (RGPD) : `userId` vient de la session vérifiée. */
export const accountData = {
  delete: (userId: string) => account.deleteAccount(prisma, userId),
  export: (userId: string) => account.exportAccount(prisma, userId),
};
import * as account from "./account";

/** Parrainage : `playerId` vient toujours de la session vérifiée. */
export const referralData = {
  summary: (playerId: string) => referral.referralSummary(prisma, playerId),
  codeExists: (code: string) => referral.referralCodeExists(prisma, code),
  settle: (playerId: string) => referral.settleReferral(prisma, playerId),
};
import * as referral from "./referral";

/** Notifications : abonnements du joueur (`playerId` de la session) et envoi planifié. */
export const notificationData = {
  subscribe: (playerId: string, target: notifications.PushTarget) =>
    notifications.saveSubscription(prisma, playerId, target),
  unsubscribe: (playerId: string, endpoint: string) =>
    notifications.deleteSubscription(prisma, playerId, endpoint),
  /** `null` si les clés VAPID manquent. */
  sendDue: async () => {
    const sender = createWebPushSender();
    if (!sender) return null;
    return notifications.sendDueNotifications(prisma, sender, new Date());
  },
};
import * as notifications from "./notifications";
import { createWebPushSender } from "./web-push";

/** Le joueur possède-t-il ce club dans cette rareté ? (partage d'une carte) */
export async function ownsCard(
  playerId: string,
  clubId: string,
  rarity: string,
): Promise<boolean> {
  const card = await prisma.ownedCard.findUnique({
    where: { playerId_clubId_rarity: { playerId, clubId, rarity } },
    select: { count: true },
  });
  return card !== null;
}

/** Club du catalogue par identifiant (pour les routes qui reçoivent un identifiant). */
export function catalogClub(clubId: string) {
  return CLUB_CATALOG.find((club) => club.id === clubId) ?? null;
}
