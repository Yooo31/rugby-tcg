import "server-only";
import { giveawaySchema, type Giveaway } from "@/domain";
import type { PrismaClient } from "@/generated/prisma/client";

/** Cadeaux en cours à l'instant `now` (les autres n'intéressent pas le joueur). */
export async function activeGiveaways(
  prisma: PrismaClient,
  now: Date,
): Promise<Giveaway[]> {
  const rows = await prisma.giveaway.findMany({
    where: { startsAt: { lte: now }, endsAt: { gt: now } },
    orderBy: { startsAt: "asc" },
  });
  return rows.map(toGiveaway);
}

export function toGiveaway(row: {
  id: string;
  title: string;
  ingots: number;
  boosters: number;
  startsAt: Date;
  endsAt: Date;
}): Giveaway {
  return giveawaySchema.parse({
    id: row.id,
    title: row.title,
    reward: { ingots: row.ingots, boosters: row.boosters },
    startsAt: row.startsAt.getTime(),
    endsAt: row.endsAt.getTime(),
  });
}
