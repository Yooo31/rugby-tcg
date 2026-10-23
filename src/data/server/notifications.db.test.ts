import { BOOSTER_REFILL_MS } from "@/domain";
import { createAuthUser, createTestPrisma } from "@/test/db";
import {
  deleteSubscription,
  saveSubscription,
  sendDueNotifications,
  type PushSender,
} from "./notifications";
import { ensurePlayerRow } from "./prisma-store";

const prisma = createTestPrisma();
afterAll(() => prisma.$disconnect());

async function subscribedPlayer(endpointSuffix: string) {
  const id = await createAuthUser(prisma);
  await ensurePlayerRow(prisma, id);
  await saveSubscription(prisma, id, {
    endpoint: `https://push.test/${endpointSuffix}-${Math.random()}`,
    p256dh: "clé",
    auth: "secret",
  });
  return id;
}

describe("notifications en base", () => {
  beforeEach(() => prisma.pushSubscription.deleteMany());

  it("prévient la réserve pleine une seule fois et oublie les appareils désabonnés", async () => {
    const since = new Date("2026-10-23T06:00:00Z");
    const id = await subscribedPlayer("plein");
    await prisma.player.update({
      where: { id },
      data: { reserveCount: 0, reserveSince: since },
    });
    const gone = await subscribedPlayer("parti");
    await prisma.player.update({
      where: { id: gone },
      data: { reserveCount: 3, reserveSince: since },
    });

    const sent: string[] = [];
    const send: PushSender = async (target, message) => {
      sent.push(message.title);
      return target.endpoint.includes("parti") ? "gone" : "sent";
    };
    const now = new Date(since.getTime() + 3 * BOOSTER_REFILL_MS);

    expect(await sendDueNotifications(prisma, send, now)).toEqual({
      players: 2,
      sent: 1,
      removed: 1,
    });
    expect(sent).toEqual([
      "Vos 3 boosters sont prêts",
      "Vos 3 boosters sont prêts",
    ]);

    sent.length = 0;
    await sendDueNotifications(prisma, send, new Date(now.getTime() + 60_000));
    expect(sent).toEqual([]);
  });

  it("enregistre et retire l'abonnement d'un appareil", async () => {
    const id = await createAuthUser(prisma);
    await ensurePlayerRow(prisma, id);
    const target = {
      endpoint: `https://push.test/${Math.random()}`,
      p256dh: "k",
      auth: "a",
    };
    await saveSubscription(prisma, id, target);
    await saveSubscription(prisma, id, target);
    expect(
      await prisma.pushSubscription.count({ where: { playerId: id } }),
    ).toBe(1);
    await deleteSubscription(prisma, id, target.endpoint);
    expect(
      await prisma.pushSubscription.count({ where: { playerId: id } }),
    ).toBe(0);
  });
});
