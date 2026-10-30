import { createAuthUser, createTestPrisma } from "@/test/db";
import { ensurePlayerRow } from "./prisma-store";
import { revenueData } from "./revenue";

const prisma = createTestPrisma();
afterAll(() => prisma.$disconnect());

// Un mois de l'an 2000 : aucun autre test n'y écrit, les chiffres sont exacts.
const month = {
  key: "2000-03",
  start: new Date("2000-02-29T23:00:00Z"),
  end: new Date("2000-03-31T22:00:00Z"),
};
const inMonth = new Date("2000-03-10T12:00:00Z");
const DAY_MS = 24 * 60 * 60 * 1000;

async function newPlayer(): Promise<string> {
  const id = await createAuthUser(prisma);
  await ensurePlayerRow(prisma, id);
  return id;
}

describe("indicateurs de revenu", () => {
  it("compte actifs, payeurs, ventes, remboursements, VIP et lingots du mois", async () => {
    const [free, buyer, vip, refunded, lapsed] = await Promise.all(
      Array.from({ length: 5 }, newPlayer),
    );
    for (const playerId of [free, buyer, vip, refunded])
      await prisma.boosterOpening.create({
        data: { playerId, source: "free", cards: [], openedAt: inMonth },
      });
    await prisma.ingotPurchase.create({
      data: {
        playerId: buyer,
        packId: "bag",
        ingots: 650,
        priceCents: 599,
        reference: `rev-${buyer}`,
        createdAt: inMonth,
      },
    });
    await prisma.ingotPurchase.create({
      data: {
        playerId: refunded,
        packId: "trunk",
        ingots: 3_000,
        priceCents: 2_499,
        reference: `rev-${refunded}`,
        createdAt: inMonth,
        refundedAt: new Date(inMonth.getTime() + DAY_MS),
      },
    });
    await prisma.vipMembership.create({
      data: {
        playerId: vip,
        startsAt: inMonth,
        endsAt: new Date(inMonth.getTime() + 30 * DAY_MS),
        offerId: "vip-month",
        priceCents: 599,
        reference: `rev-${vip}`,
        createdAt: inMonth,
      },
    });
    // VIP payant au début du mois, qui n'a pas renouvelé.
    await prisma.vipMembership.create({
      data: {
        playerId: lapsed,
        startsAt: new Date("2000-02-15T00:00:00Z"),
        endsAt: new Date("2000-03-16T00:00:00Z"),
        offerId: "vip-month",
        priceCents: 599,
        reference: `rev-${lapsed}`,
        createdAt: new Date("2000-02-15T00:00:00Z"),
      },
    });
    await prisma.ingotFlow.create({
      data: { day: "2000-03-10", earned: 120, spent: 100 },
    });

    const data = await revenueData(
      prisma,
      [month],
      new Date("2000-04-15T00:00:00Z"),
    );
    const [figures] = data.months;
    expect(figures).toMatchObject({
      key: "2000-03",
      activePlayers: 4,
      payers: 2,
      ingotBuyers: 1,
      refunds: { count: 1, cents: 2_499 },
      newVip: 1,
      vipAtStart: 1,
      vipLost: 1,
      ingotsEarned: 120,
      ingotsSpent: 100,
      ingotsBought: 650,
    });
    expect(figures?.sales).toEqual([
      { kind: "ingots", item: "bag", count: 1, cents: 599 },
      { kind: "vip", item: "vip-month", count: 1, cents: 599 },
    ]);
    expect(data.payerIds.has(buyer)).toBe(true);
    expect(data.payerIds.has(refunded)).toBe(false);
    expect(data.payerIds.has(free)).toBe(false);
  });

  it("ramène chaque pass VIP payé en cours à un revenu mensuel", async () => {
    const playerId = await newPlayer();
    const now = new Date("2001-06-15T00:00:00Z");
    await prisma.vipMembership.create({
      data: {
        playerId,
        startsAt: new Date("2001-06-01T00:00:00Z"),
        endsAt: new Date("2002-06-01T00:00:00Z"),
        offerId: "vip-year",
        priceCents: 4_999,
        reference: `mrr-${playerId}`,
      },
    });
    const data = await revenueData(prisma, [], now);
    // 49,99 € sur 365 jours, ramenés à 30 jours.
    expect(data.mrrCents).toBe(Math.round((4_999 * 30) / 365));
    expect(data.activeVip).toBe(1);
  });
});
