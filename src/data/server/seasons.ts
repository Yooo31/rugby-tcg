import "server-only";
import { seasonSchema, type Season } from "@/domain";
import type { PrismaClient } from "@/generated/prisma/client";

export function toSeason(row: {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
}): Season {
  return seasonSchema.parse({
    id: row.id,
    title: row.title,
    startsAt: row.startsAt.getTime(),
    endsAt: row.endsAt.getTime(),
  });
}

/** Saison en cours à l'instant `now`, ou `null` (une seule à la fois). */
export async function activeSeason(
  prisma: PrismaClient,
  now: Date,
): Promise<Season | null> {
  const row = await prisma.season.findFirst({
    where: { startsAt: { lte: now }, endsAt: { gt: now } },
    orderBy: { startsAt: "desc" },
  });
  return row ? toSeason(row) : null;
}
