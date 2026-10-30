import { createAuthUser, createTestPrisma, seedClubs } from "@/test/db";
import { grantVip } from "./admin";
import { postgresPlayerRepository } from "./player-repository";
import { ensurePlayerRow } from "./prisma-store";
import { creditVipPurchase } from "./purchases";

const prisma = createTestPrisma();
beforeAll(() => seedClubs(prisma));
afterAll(() => prisma.$disconnect());

const DAY_MS = 24 * 60 * 60 * 1000;

async function newPlayer(): Promise<string> {
  const playerId = await createAuthUser(prisma);
  await ensurePlayerRow(prisma, playerId);
  return playerId;
}

describe("pass VIP en base", () => {
  it("crédite un achat une seule fois, même en rafale", async () => {
    const playerId = await newPlayer();
    const now = new Date();
    const reference = `vip-${playerId}`;
    const results = await Promise.all(
      Array.from({ length: 3 }, () =>
        creditVipPurchase(
          prisma,
          playerId,
          { offerId: "vip-month", reference },
          now,
        ),
      ),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    const memberships = await prisma.vipMembership.findMany({
      where: { playerId },
    });
    expect(memberships).toHaveLength(1);
    expect(memberships[0]).toMatchObject({
      offerId: "vip-month",
      priceCents: 599,
      reference,
      grantedBy: null,
    });
    expect(
      memberships[0].endsAt.getTime() - memberships[0].startsAt.getTime(),
    ).toBe(30 * DAY_MS);
  });

  it("ajoute un don de l'admin à la suite et ouvre les avantages", async () => {
    const playerId = await newPlayer();
    const now = new Date();
    await creditVipPurchase(
      prisma,
      playerId,
      { offerId: "vip-month", reference: `suite-${playerId}` },
      now,
    );
    await grantVip(prisma, playerId, "admin@example.com", now);

    const player = postgresPlayerRepository(prisma, playerId);
    const snapshot = await player.get();
    expect(snapshot.vip.isActive).toBe(true);
    expect(snapshot.vip.until).toBeGreaterThanOrEqual(
      now.getTime() + 60 * DAY_MS,
    );
    expect(snapshot.boosters.max).toBe(5);

    const opening = await player.openVipBooster();
    expect(opening.cards.some(({ rarity }) => rarity === "common")).toBe(false);
    expect(opening.player.vip.booster.status).toBe("waiting");
    expect(
      (await prisma.player.findUniqueOrThrow({ where: { id: playerId } }))
        .vipBoosterAt,
    ).not.toBeNull();
    expect(
      await prisma.boosterOpening.count({ where: { playerId, source: "vip" } }),
    ).toBe(1);
  });

  it("refuse une période sans origine", async () => {
    const playerId = await newPlayer();
    await expect(
      prisma.vipMembership.create({
        data: {
          playerId,
          startsAt: new Date(),
          endsAt: new Date(Date.now() + DAY_MS),
        },
      }),
    ).rejects.toThrow();
  });
});
