import { createAuthUser, createTestPrisma } from "@/test/db";
import { ensurePlayerRow } from "./prisma-store";
import { creditIngotPurchase } from "./purchases";

const prisma = createTestPrisma();
afterAll(() => prisma.$disconnect());

async function ingotsOf(playerId: string): Promise<number> {
  return (await prisma.player.findUniqueOrThrow({ where: { id: playerId } }))
    .ingots;
}

describe("achat de lingots", () => {
  it("crédite le paquet et trace l'achat", async () => {
    const playerId = await createAuthUser(prisma);
    await ensurePlayerRow(prisma, playerId);
    const reference = `paiement-${playerId}`;

    expect(
      await creditIngotPurchase(prisma, playerId, { packId: "bag", reference }),
    ).toBe(true);
    expect(await ingotsOf(playerId)).toBe(650);
    expect(
      await prisma.ingotPurchase.findMany({
        where: { playerId },
        select: {
          packId: true,
          ingots: true,
          priceCents: true,
          reference: true,
        },
      }),
    ).toEqual([{ packId: "bag", ingots: 650, priceCents: 599, reference }]);
  });

  it("ne crédite qu'une fois un même paiement, même en rafale", async () => {
    const playerId = await createAuthUser(prisma);
    await ensurePlayerRow(prisma, playerId);
    const reference = `rafale-${playerId}`;
    const results = await Promise.all(
      Array.from({ length: 3 }, () =>
        creditIngotPurchase(prisma, playerId, { packId: "handful", reference }),
      ),
    );
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await ingotsOf(playerId)).toBe(200);
    expect(await prisma.ingotPurchase.count({ where: { playerId } })).toBe(1);
  });

  it("s'ajoute aux lingots déjà gagnés", async () => {
    const playerId = await createAuthUser(prisma);
    await ensurePlayerRow(prisma, playerId);
    await prisma.player.update({
      where: { id: playerId },
      data: { ingots: 120 },
    });
    await creditIngotPurchase(prisma, playerId, {
      packId: "trunk",
      reference: `cumul-${playerId}`,
    });
    expect(await ingotsOf(playerId)).toBe(3_120);
  });
});
