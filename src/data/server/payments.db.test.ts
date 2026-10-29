import { createAuthUser, createTestPrisma } from "@/test/db";
import { postgresPlayerRepository } from "./player-repository";
import { ensurePlayerRow } from "./prisma-store";
import { creditPurchase, revokePurchase } from "./purchases";

const prisma = createTestPrisma();
afterAll(() => prisma.$disconnect());

async function newPlayer(): Promise<string> {
  const playerId = await createAuthUser(prisma);
  await ensurePlayerRow(prisma, playerId);
  return playerId;
}

const ingotsOf = async (playerId: string) =>
  (await prisma.player.findUniqueOrThrow({ where: { id: playerId } })).ingots;

describe("paiements en base", () => {
  it("reprend les lingots d'un achat remboursé, sans passer sous zéro, une fois", async () => {
    const playerId = await newPlayer();
    const reference = `rembourse-${playerId}`;
    await creditPurchase(
      prisma,
      playerId,
      { kind: "ingots", id: "handful" },
      reference,
      new Date(),
    );
    await prisma.player.update({
      where: { id: playerId },
      data: { ingots: 150 },
    });

    expect(await revokePurchase(prisma, reference)).toBe("ingots");
    expect(await ingotsOf(playerId)).toBe(0);
    expect(await revokePurchase(prisma, reference)).toBeNull();
    expect(await revokePurchase(prisma, "inconnu")).toBeNull();
  });

  it("retire le VIP d'un achat remboursé", async () => {
    const playerId = await newPlayer();
    const reference = `vip-rembourse-${playerId}`;
    await creditPurchase(
      prisma,
      playerId,
      { kind: "vip", id: "vip-month" },
      reference,
      new Date(),
    );
    const player = postgresPlayerRepository(prisma, playerId);
    expect((await player.get()).vip.isActive).toBe(true);
    expect(await revokePurchase(prisma, reference)).toBe("vip");
    expect((await player.get()).vip.isActive).toBe(false);
  });

  it("vend la voie payante d'une saison une fois, puis la retire au remboursement", async () => {
    const playerId = await newPlayer();
    // Saison passée : elle ne gêne pas les autres tests, qui lisent la saison en cours.
    const season = await prisma.season.create({
      data: {
        title: `Saison ${playerId}`,
        startsAt: new Date("2001-01-01T00:00:00Z"),
        endsAt: new Date("2001-03-01T00:00:00Z"),
        createdBy: "admin@example.com",
      },
    });
    const product = { kind: "season-pass", id: season.id } as const;
    const reference = `saison-${playerId}`;
    expect(
      await creditPurchase(prisma, playerId, product, reference, new Date()),
    ).toBe(true);
    expect(
      await creditPurchase(prisma, playerId, product, reference, new Date()),
    ).toBe(false);
    expect(
      (await prisma.seasonPass.findMany({ where: { playerId } })).map(
        ({ priceCents, grantedBy }) => [priceCents, grantedBy],
      ),
    ).toEqual([[599, null]]);
    expect(await revokePurchase(prisma, reference)).toBe("season-pass");
    expect(
      await prisma.seasonPass.count({ where: { playerId, refundedAt: null } }),
    ).toBe(0);
    await prisma.season.delete({ where: { id: season.id } });
  });
});
