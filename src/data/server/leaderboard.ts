import "server-only";
import {
  departmentsOfRegion,
  LEADERBOARD_SIZE,
  type Leaderboard,
  type LeaderboardEntry,
  type RegionId,
} from "@/domain";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { LeaderboardRepository } from "../repositories";

interface RankedRow {
  readonly id: string;
  readonly username: string;
  readonly clubs: number;
  readonly rank: bigint;
}

/**
 * Classement calculé en base : clubs différents par joueur (avec pseudo),
 * rangés par `rank()` comme `rankScores` du domaine. Ne renvoie que le haut du
 * tableau et la ligne du joueur.
 */
export function createPrismaLeaderboard(
  prisma: PrismaClient,
  playerId: string,
): LeaderboardRepository {
  return {
    get: async (region: RegionId | null): Promise<Leaderboard> => {
      // La région n'est pas stockée : on filtre sur ses départements.
      const regionFilter = region
        ? Prisma.sql`AND c.department = ANY(${departmentsOfRegion(region)}::text[])`
        : Prisma.empty;

      const rows = await prisma.$queryRaw<RankedRow[]>`
        WITH scores AS (
          SELECT p.id, p.username, count(DISTINCT oc.club_id)::int AS clubs
          FROM players p
          JOIN owned_cards oc ON oc.player_id = p.id
          JOIN clubs c ON c.id = oc.club_id
          WHERE p.username IS NOT NULL ${regionFilter}
          GROUP BY p.id, p.username
        ),
        ranked AS (
          SELECT *, rank() OVER (ORDER BY clubs DESC) AS rank FROM scores
        )
        SELECT id, username, clubs, rank FROM ranked
        WHERE rank <= ${LEADERBOARD_SIZE} OR id = ${playerId}::uuid
        ORDER BY rank, lower(username)`;

      const toEntry = (row: RankedRow): LeaderboardEntry => ({
        rank: Number(row.rank),
        username: row.username,
        clubs: row.clubs,
        isMe: row.id === playerId,
      });
      const mine = rows.find((row) => row.id === playerId);
      return {
        entries: rows
          .filter((row) => Number(row.rank) <= LEADERBOARD_SIZE)
          .map(toEntry),
        me: mine ? toEntry(mine) : null,
      };
    },
  };
}
