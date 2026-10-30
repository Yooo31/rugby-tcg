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

  it("annonce les boosters regagnés une seule fois et oublie les appareils désabonnés", async () => {
    // 6 h à Paris : le message part à 18 h, avant le rappel du soir.
    const since = new Date("2026-10-23T04:00:00Z");
    const id = await subscribedPlayer("plein");
    await prisma.player.update({
      where: { id },
      data: { reserveCount: 0, reserveSince: since },
    });
    const gone = await subscribedPlayer("parti");
    await prisma.player.update({
      where: { id: gone },
      data: { reserveCount: 2, reserveSince: since },
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

  it("compte la réserve d'un VIP, puis rappelle le soir les boosters non ouverts", async () => {
    const since = new Date("2026-10-23T04:00:00Z");
    const id = await subscribedPlayer("vip");
    await prisma.player.update({
      where: { id },
      data: { reserveCount: 0, reserveSince: since, bonusBoosters: 1 },
    });
    await prisma.vipMembership.create({
      data: {
        playerId: id,
        startsAt: new Date("2026-10-01T00:00:00Z"),
        endsAt: new Date("2026-11-01T00:00:00Z"),
        grantedBy: "admin@example.com",
      },
    });
    const sent: string[] = [];
    const send: PushSender = async (_target, message) => {
      sent.push(message.title);
      return "sent";
    };

    // 18 h à Paris : 3 boosters regagnés sur une réserve VIP de 5.
    await sendDueNotifications(prisma, send, new Date("2026-10-23T16:00:00Z"));
    // 20 h à Paris : 3 gratuits et 1 bonus attendent.
    await sendDueNotifications(prisma, send, new Date("2026-10-23T18:00:00Z"));
    // Plus tard le même soir : rien de neuf.
    await sendDueNotifications(prisma, send, new Date("2026-10-23T19:00:00Z"));
    expect(sent).toEqual([
      "3 boosters sont prêts",
      "Il vous reste 4 boosters à ouvrir",
    ]);
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

  it("n'envoie qu'une fois le même rappel, même lancé deux fois en même temps", async () => {
    const id = await subscribedPlayer("double");
    await prisma.player.update({
      where: { id },
      data: { reserveCount: 1, reserveSince: new Date("2026-10-23T17:00:00Z") },
    });
    const sent: string[] = [];
    const send: PushSender = async (_target, message) => {
      sent.push(message.title);
      return "sent";
    };
    // 20 h 30 à Paris : rappel du soir.
    const evening = new Date("2026-10-23T18:30:00Z");
    await Promise.all([
      sendDueNotifications(prisma, send, evening),
      sendDueNotifications(prisma, send, evening),
    ]);
    expect(sent).toEqual(["Il vous reste 1 booster à ouvrir"]);
  });
});
