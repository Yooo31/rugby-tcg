import { createAuthUser, createTestPrisma } from "@/test/db";
import { ensurePlayerRow } from "./prisma-store";
import {
  createPromotion,
  currentPromotion,
  endPromotion,
  listPromotions,
  PromotionTooCloseError,
} from "./promotions";
import { creditPurchase } from "./purchases";

const prisma = createTestPrisma();
afterAll(() => prisma.$disconnect());
beforeEach(() => prisma.promotion.deleteMany());

const DAY_MS = 24 * 60 * 60 * 1000;
const now = new Date("2027-03-01T12:00:00Z");
const days = (count: number) => now.getTime() + count * DAY_MS;

describe("promotions en base", () => {
  it("programme une promotion, puis refuse une autre à moins de 30 jours", async () => {
    await createPromotion(
      prisma,
      { title: "Tournoi", percentOff: 30, startsAt: days(1), endsAt: days(4) },
      "admin@example.com",
      now,
    );
    await expect(
      createPromotion(
        prisma,
        {
          title: "Trop tôt",
          percentOff: 20,
          startsAt: days(20),
          endsAt: days(22),
        },
        "admin@example.com",
        now,
      ),
    ).rejects.toBeInstanceOf(PromotionTooCloseError);
    await createPromotion(
      prisma,
      {
        title: "Plus tard",
        percentOff: 20,
        startsAt: days(34),
        endsAt: days(36),
      },
      "admin@example.com",
      now,
    );
    expect(
      (await listPromotions(prisma)).map(({ promotion }) => promotion.title),
    ).toEqual(["Plus tard", "Tournoi"]);
    expect(await currentPromotion(prisma, new Date(days(2)))).toMatchObject({
      title: "Tournoi",
      percentOff: 30,
    });
    expect(await currentPromotion(prisma, now)).toBeNull();
  });

  it("arrête une promotion en cours et annule une promotion à venir", async () => {
    await createPromotion(
      prisma,
      {
        title: "En cours",
        percentOff: 10,
        startsAt: days(-1),
        endsAt: days(2),
      },
      "admin@example.com",
      new Date(days(-2)),
    );
    await createPromotion(
      prisma,
      {
        title: "À venir",
        percentOff: 10,
        startsAt: days(40),
        endsAt: days(41),
      },
      "admin@example.com",
      now,
    );
    const [future, running] = await listPromotions(prisma);
    await endPromotion(prisma, running!.promotion.id, now);
    await endPromotion(prisma, future!.promotion.id, now);
    expect(await currentPromotion(prisma, now)).toBeNull();
    // L'arrêtée reste dans l'historique (elle compte pour l'écart de 30 jours).
    expect(
      (await listPromotions(prisma)).map(({ promotion }) => promotion.title),
    ).toEqual(["En cours"]);
  });

  it("enregistre le prix réellement payé pendant une promotion", async () => {
    const playerId = await createAuthUser(prisma);
    await ensurePlayerRow(prisma, playerId);
    await creditPurchase(
      prisma,
      playerId,
      { kind: "ingots", id: "bag" },
      `promo-${playerId}`,
      now,
      419,
    );
    expect(
      await prisma.ingotPurchase.findFirstOrThrow({
        where: { playerId },
        select: { priceCents: true, ingots: true },
      }),
    ).toEqual({ priceCents: 419, ingots: 700 });
  });
});
