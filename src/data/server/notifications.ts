import "server-only";
import {
  dueNotifications,
  notificationMessage,
  type NotificationKind,
  type NotificationMessage,
  type NotificationState,
} from "@/domain";
import type { PrismaClient } from "@/generated/prisma/client";
import { notificationStateOf, notifiedFields } from "./notification-state";

export interface PushTarget {
  readonly endpoint: string;
  readonly p256dh: string;
  readonly auth: string;
}

/** Résultat d'un envoi : `gone` si l'appareil s'est désabonné (on l'oublie). */
export type PushResult = "sent" | "gone" | "failed";

/** Envoi réel par Web Push en production, doublure dans les tests. */
export type PushSender = (
  target: PushTarget,
  message: NotificationMessage,
) => Promise<PushResult>;

/** Enregistre l'appareil du joueur (le même appareil passe au dernier joueur connecté). */
export async function saveSubscription(
  prisma: PrismaClient,
  playerId: string,
  target: PushTarget,
): Promise<void> {
  await prisma.pushSubscription.upsert({
    where: { endpoint: target.endpoint },
    create: { playerId, ...target },
    update: { playerId, p256dh: target.p256dh, auth: target.auth },
  });
}

export async function deleteSubscription(
  prisma: PrismaClient,
  playerId: string,
  endpoint: string,
): Promise<void> {
  await prisma.pushSubscription.deleteMany({ where: { playerId, endpoint } });
}

export interface NotificationRun {
  readonly players: number;
  readonly sent: number;
  readonly removed: number;
}

/** Envoie un message à chaque appareil ; oublie ceux qui se sont désabonnés. */
async function deliver(
  prisma: PrismaClient,
  send: PushSender,
  subscriptions: readonly (PushTarget & { readonly id: bigint })[],
  message: NotificationMessage,
): Promise<{ sent: number; removed: number }> {
  let sent = 0;
  let removed = 0;
  for (const subscription of subscriptions) {
    const result = await send(subscription, message);
    if (result === "sent") sent += 1;
    if (result === "gone") {
      await prisma.pushSubscription.delete({ where: { id: subscription.id } });
      removed += 1;
    }
  }
  return { sent, removed };
}

/**
 * Décide des notifications d'un joueur et les note, sous verrou de sa ligne :
 * deux déclenchements simultanés ne peuvent pas décider le même envoi.
 */
async function claimDue(
  prisma: PrismaClient,
  playerId: string,
  now: Date,
): Promise<{ due: NotificationKind[]; state: NotificationState } | null> {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM players WHERE id = ${playerId}::uuid FOR UPDATE`;
    const player = await tx.player.findUnique({
      where: { id: playerId },
      include: {
        vipMemberships: {
          where: { refundedAt: null },
          select: { startsAt: true, endsAt: true },
        },
      },
    });
    if (!player) return null;
    const state = notificationStateOf(player, now);
    const due = dueNotifications(state, now);
    if (due.length === 0) return null;
    // Noté avant l'envoi, même si un appareil échoue : on ne harcèle pas.
    await tx.player.update({
      where: { id: playerId },
      data: notifiedFields(due, state, now),
    });
    return { due, state };
  });
}

/**
 * Envoie les notifications dues (booster regagné, rappel du soir, série) à
 * tous les joueurs abonnés. À lancer régulièrement (toutes les 15 minutes).
 */
export async function sendDueNotifications(
  prisma: PrismaClient,
  send: PushSender,
  now: Date,
): Promise<NotificationRun> {
  const players = await prisma.player.findMany({
    where: { pushSubscriptions: { some: {} } },
    select: { id: true, pushSubscriptions: true },
  });

  let sent = 0;
  let removed = 0;
  for (const player of players) {
    const claimed = await claimDue(prisma, player.id, now);
    if (!claimed) continue;
    for (const kind of claimed.due) {
      const run = await deliver(
        prisma,
        send,
        player.pushSubscriptions,
        notificationMessage(kind, claimed.state, now),
      );
      sent += run.sent;
      removed += run.removed;
    }
  }
  return { players: players.length, sent, removed };
}
