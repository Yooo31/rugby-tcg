import "server-only";
import { UsernameTakenError } from "@/domain";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type {
  PlayerEvent,
  PlayerRecord,
  PlayerStore,
} from "../player/repository";
import { toDayKey } from "@/lib/dates";
import {
  ingotFlow,
  recordChanges,
  recordFromRows,
  type PlayerWrites,
} from "./rows";

type Db = PrismaClient | Prisma.TransactionClient;

/** Durée maximale d'une action (verrou compris), en millisecondes. */
const TRANSACTION_TIMEOUT_MS = 10_000;

/**
 * Crée la ligne du joueur si besoin : un joueur sans ligne commence à zéro.
 * `ON CONFLICT DO NOTHING` est atomique, contrairement à un `upsert` Prisma :
 * deux premières requêtes simultanées ne se heurtent pas.
 * Renvoie `true` si la ligne vient d'être créée.
 */
export async function ensurePlayerRow(
  db: Db,
  playerId: string,
): Promise<boolean> {
  const inserted =
    await db.$executeRaw`INSERT INTO players (id, updated_at) VALUES (${playerId}::uuid, now()) ON CONFLICT (id) DO NOTHING`;
  return inserted > 0;
}

/** Erreur Prisma levée par une contrainte d'unicité. */
export function isUniqueViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function loadRecord(db: Db, playerId: string): Promise<PlayerRecord> {
  // Requêtes l'une après l'autre : dans une transaction, elles partagent une
  // seule connexion, qui n'accepte pas de requêtes simultanées.
  const player = await db.player.findUniqueOrThrow({ where: { id: playerId } });
  const ownedCards = await db.ownedCard.findMany({
    where: { playerId },
    orderBy: { firstObtainedAt: "asc" },
  });
  const ownedSpecialCards = await db.ownedSpecialCard.findMany({
    where: { playerId },
    orderBy: { firstObtainedAt: "asc" },
  });
  const missionLog = await db.missionLog.findUnique({ where: { playerId } });
  const claimedAlbums = await db.claimedAlbum.findMany({
    where: { playerId },
    orderBy: { claimedAt: "asc" },
  });
  const claimedGiveaways = await db.claimedGiveaway.findMany({
    where: { playerId },
    orderBy: { claimedAt: "asc" },
  });
  const ownedCosmetics = await db.ownedCosmetic.findMany({
    where: { playerId },
    orderBy: { obtainedAt: "asc" },
  });
  const seasonLog = await db.seasonLog.findUnique({ where: { playerId } });
  // Un achat remboursé ne donne plus rien.
  const seasonPasses = await db.seasonPass.findMany({
    where: { playerId, refundedAt: null },
    select: { seasonId: true },
  });
  const vipMemberships = await db.vipMembership.findMany({
    where: { playerId, refundedAt: null },
    select: { startsAt: true, endsAt: true },
    orderBy: { startsAt: "asc" },
  });
  return recordFromRows({
    player,
    ownedCards,
    ownedSpecialCards,
    missionLog,
    claimedAlbumIds: claimedAlbums.map(({ albumId }) => albumId),
    claimedGiveawayIds: claimedGiveaways.map(({ giveawayId }) => giveawayId),
    ownedCosmeticIds: ownedCosmetics.map(({ cosmeticId }) => cosmeticId),
    seasonLog,
    seasonPassIds: seasonPasses.map(({ seasonId }) => seasonId),
    vipMemberships,
  });
}

async function saveWrites(
  db: Prisma.TransactionClient,
  playerId: string,
  writes: PlayerWrites,
): Promise<void> {
  if (writes.player) {
    try {
      await db.player.update({ where: { id: playerId }, data: writes.player });
    } catch (error) {
      // Seule contrainte d'unicité de la table, hors clé : le pseudo.
      if (isUniqueViolation(error)) throw new UsernameTakenError();
      throw error;
    }
  }
  // La ligne du joueur est verrouillée : on peut écrire le compte exact.
  for (const card of writes.cards) {
    await db.ownedCard.upsert({
      where: {
        playerId_clubId_rarity: {
          playerId,
          clubId: card.clubId,
          rarity: card.rarity,
        },
      },
      create: { playerId, ...card },
      update: { count: card.count },
    });
  }
  for (const card of writes.specialCards) {
    await db.ownedSpecialCard.upsert({
      where: {
        playerId_specialId: { playerId, specialId: card.specialId },
      },
      create: { playerId, ...card },
      update: { count: card.count },
    });
  }
  if (writes.seasonLog) {
    const log = {
      seasonId: writes.seasonLog.seasonId,
      xp: writes.seasonLog.xp,
      claimedFree: [...writes.seasonLog.claimedFree],
      claimedPremium: [...writes.seasonLog.claimedPremium],
    };
    await db.seasonLog.upsert({
      where: { playerId },
      create: { playerId, ...log },
      update: log,
    });
  }
  if (writes.missionLog) {
    const log = {
      day: writes.missionLog.day,
      progress: writes.missionLog.progress,
      claimed: writes.missionLog.claimed,
    };
    await db.missionLog.upsert({
      where: { playerId },
      create: { playerId, ...log },
      update: log,
    });
  }
  if (writes.newClaimedAlbumIds.length > 0) {
    await db.claimedAlbum.createMany({
      data: writes.newClaimedAlbumIds.map((albumId) => ({ playerId, albumId })),
    });
  }
  if (writes.newClaimedGiveawayIds.length > 0) {
    await db.claimedGiveaway.createMany({
      data: writes.newClaimedGiveawayIds.map((giveawayId) => ({
        playerId,
        giveawayId,
      })),
    });
  }
  if (writes.newCosmeticIds.length > 0) {
    await db.ownedCosmetic.createMany({
      data: writes.newCosmeticIds.map((cosmeticId) => ({
        playerId,
        cosmeticId,
      })),
    });
  }
}

async function saveEvents(
  db: Prisma.TransactionClient,
  playerId: string,
  events: readonly PlayerEvent[],
): Promise<void> {
  for (const event of events) {
    switch (event.type) {
      case "booster-opened":
        await db.boosterOpening.create({
          data: {
            playerId,
            source: event.source,
            cards: event.cards.map(({ clubId, rarity }) => ({
              clubId,
              rarity,
            })),
          },
        });
        break;
      case "ingots-purchased":
        await db.ingotPurchase.create({
          data: {
            playerId,
            packId: event.packId,
            ingots: event.ingots,
            priceCents: event.priceCents,
            reference: event.reference,
          },
        });
        break;
      case "vip-granted":
        // Les périodes ne s'écrivent que par cet événement : une période
        // achetée garde sa référence de paiement, unique.
        await db.vipMembership.create({
          data: {
            playerId,
            startsAt: new Date(event.membership.startsAt),
            endsAt: new Date(event.membership.endsAt),
            offerId: event.purchase?.offerId,
            priceCents: event.purchase?.priceCents,
            reference: event.purchase?.reference,
            grantedBy: event.grantedBy,
          },
        });
        break;
      case "admin-adjusted":
        await db.adminAdjustment.create({
          data: {
            playerId,
            adminEmail: event.adminEmail,
            ingotsDelta: event.adjustment.ingotsDelta,
            boostersDelta: event.adjustment.boostersDelta,
            reason: event.adjustment.reason,
          },
        });
        break;
    }
  }
}

/** Ajoute les lingots gagnés ou dépensés au total du jour (heure de Paris). */
async function saveIngotFlow(
  db: Prisma.TransactionClient,
  flow: { readonly earned: number; readonly spent: number },
): Promise<void> {
  if (flow.earned === 0 && flow.spent === 0) return;
  const day = toDayKey(new Date());
  await db.$executeRaw`INSERT INTO ingot_flows (day, earned, spent)
    VALUES (${day}, ${flow.earned}, ${flow.spent})
    ON CONFLICT (day) DO UPDATE SET
      earned = ingot_flows.earned + EXCLUDED.earned,
      spent = ingot_flows.spent + EXCLUDED.spent`;
}

/**
 * État d'un joueur dans Postgres. Chaque action tourne dans une transaction
 * qui verrouille la ligne du joueur (`FOR UPDATE`) : deux requêtes simultanées
 * s'exécutent l'une après l'autre, jamais sur le même état de départ.
 *
 * `playerId` vient toujours de la session vérifiée, jamais du navigateur.
 */
export function createPrismaPlayerStore(
  prisma: PrismaClient,
  playerId: string,
): PlayerStore {
  return {
    read: async () => {
      await ensurePlayerRow(prisma, playerId);
      return loadRecord(prisma, playerId);
    },
    update: (change) =>
      prisma.$transaction(
        async (tx) => {
          await ensurePlayerRow(tx, playerId);
          await tx.$queryRaw`SELECT id FROM players WHERE id = ${playerId}::uuid FOR UPDATE`;
          const before = await loadRecord(tx, playerId);
          const { record, result, events = [] } = change(before);
          await saveWrites(tx, playerId, recordChanges(before, record));
          await saveEvents(tx, playerId, events);
          await saveIngotFlow(tx, ingotFlow(before, record, events));
          return result;
        },
        { timeout: TRANSACTION_TIMEOUT_MS },
      ),
  };
}
