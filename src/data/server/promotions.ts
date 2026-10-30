import "server-only";
import {
  activePromotion,
  canSchedulePromotion,
  promotionSchema,
  type Promotion,
} from "@/domain";
import type { PrismaClient } from "@/generated/prisma/client";

function toPromotion(row: {
  id: string;
  title: string;
  percentOff: number;
  startsAt: Date;
  endsAt: Date;
}): Promotion {
  return promotionSchema.parse({
    id: row.id,
    title: row.title,
    percentOff: row.percentOff,
    startsAt: row.startsAt.getTime(),
    endsAt: row.endsAt.getTime(),
  });
}

/** La promotion en cours à l'instant `now`, ou `null`. */
export async function currentPromotion(
  prisma: PrismaClient,
  now: Date,
): Promise<Promotion | null> {
  const rows = await prisma.promotion.findMany({
    where: { startsAt: { lte: now }, endsAt: { gt: now } },
  });
  return activePromotion(rows.map(toPromotion), now.getTime());
}

export interface AdminPromotion {
  readonly promotion: Promotion;
  readonly createdBy: string;
}

/** Toutes les promotions, de la plus récente à la plus ancienne. */
export async function listPromotions(
  prisma: PrismaClient,
): Promise<AdminPromotion[]> {
  const rows = await prisma.promotion.findMany({
    orderBy: { startsAt: "desc" },
  });
  return rows.map((row) => ({
    promotion: toPromotion(row),
    createdBy: row.createdBy,
  }));
}

/** Moins de 30 jours la séparent d'une autre promotion (prix barré trompeur). */
export class PromotionTooCloseError extends Error {
  constructor() {
    super("Il faut 30 jours sans promotion avant et après chacune.");
    this.name = "PromotionTooCloseError";
  }
}

export interface NewPromotion {
  readonly title: string;
  readonly percentOff: number;
  readonly startsAt: number;
  readonly endsAt: number;
}

export async function createPromotion(
  prisma: PrismaClient,
  promotion: NewPromotion,
  adminEmail: string,
  now: Date,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    // Verrou sur la table : deux créations simultanées respectent l'écart.
    await tx.$executeRaw`LOCK TABLE promotions IN SHARE ROW EXCLUSIVE MODE`;
    const existing = await tx.promotion.findMany({
      select: { startsAt: true, endsAt: true },
    });
    const periods = existing.map(({ startsAt, endsAt }) => ({
      startsAt: startsAt.getTime(),
      endsAt: endsAt.getTime(),
    }));
    if (!canSchedulePromotion(periods, promotion, now.getTime()))
      throw new PromotionTooCloseError();
    await tx.promotion.create({
      data: {
        title: promotion.title,
        percentOff: promotion.percentOff,
        startsAt: new Date(promotion.startsAt),
        endsAt: new Date(promotion.endsAt),
        createdBy: adminEmail,
      },
    });
  });
}

/**
 * Arrête une promotion en cours tout de suite ; une promotion à venir est
 * supprimée. Une promotion passée reste dans l'historique : elle compte
 * pour l'écart de 30 jours.
 */
export async function endPromotion(
  prisma: PrismaClient,
  promotionId: string,
  now: Date,
): Promise<void> {
  const row = await prisma.promotion.findUnique({ where: { id: promotionId } });
  if (!row || row.endsAt <= now) return;
  if (row.startsAt > now) {
    await prisma.promotion.delete({ where: { id: promotionId } });
    return;
  }
  await prisma.promotion.update({
    where: { id: promotionId },
    data: { endsAt: now },
  });
}
