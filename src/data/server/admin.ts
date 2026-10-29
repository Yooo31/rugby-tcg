import "server-only";
import {
  applyAdjustment,
  RARITIES,
  type Adjustment,
  type Giveaway,
  type PlayerSnapshot,
  type Rarity,
} from "@/domain";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { secureRng } from "@/lib/rng";
import { CATALOG_ALBUMS, CLUB_CATALOG } from "../catalog";
import { createPlayerRepository } from "../player/repository";
import { activeGiveaways, toGiveaway } from "./giveaways";
import { activeSeason } from "./seasons";
import { createPrismaPlayerStore } from "./prisma-store";

/**
 * Lectures et corrections de l'administration. Aucune de ces fonctions ne
 * vérifie les droits : c'est le rôle de `requireAdmin()` dans chaque action
 * et chaque page de `@/features/admin`.
 */

/** Joueurs affichés par page de recherche. */
const ADMIN_PAGE_SIZE = 50;

export interface AdminPlayerRow {
  readonly id: string;
  readonly username: string | null;
  readonly email: string | null;
  readonly ingots: number;
  readonly bonusBoosters: number;
  readonly clubs: number;
  readonly createdAt: Date;
}

/** `%` et `_` sont des jokers de LIKE : on les neutralise dans la saisie. */
function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

/** Joueurs les plus récents, filtrés par pseudo ou adresse e-mail. */
export function searchPlayers(
  prisma: PrismaClient,
  query: string,
): Promise<AdminPlayerRow[]> {
  const trimmed = query.trim();
  const filter = trimmed
    ? Prisma.sql`WHERE p.username ILIKE ${likePattern(trimmed)} OR u.email ILIKE ${likePattern(trimmed)}`
    : Prisma.empty;
  return prisma.$queryRaw<AdminPlayerRow[]>`
    SELECT p.id, p.username, u.email::text AS email, p.ingots,
           p.bonus_boosters AS "bonusBoosters", p.created_at AS "createdAt",
           (SELECT count(DISTINCT oc.club_id) FROM owned_cards oc
             WHERE oc.player_id = p.id)::int AS clubs
    FROM players p
    JOIN auth.users u ON u.id = p.id
    ${filter}
    ORDER BY p.created_at DESC
    LIMIT ${ADMIN_PAGE_SIZE}`;
}

export interface AdminAdjustmentRow {
  readonly id: bigint;
  readonly adminEmail: string;
  readonly ingotsDelta: number;
  readonly boostersDelta: number;
  readonly reason: string;
  readonly createdAt: Date;
}

export interface AdminPlayerDetail {
  readonly id: string;
  readonly email: string | null;
  readonly createdAt: Date;
  readonly snapshot: PlayerSnapshot;
  readonly openings: number;
  readonly lastOpeningAt: Date | null;
  readonly adjustments: readonly AdminAdjustmentRow[];
}

function playerRepository(prisma: PrismaClient, playerId: string) {
  return createPlayerRepository({
    store: createPrismaPlayerStore(prisma, playerId),
    clubs: CLUB_CATALOG,
    albums: CATALOG_ALBUMS,
    rng: secureRng,
    now: () => new Date(),
    giveaways: () => activeGiveaways(prisma, new Date()),
    season: () => activeSeason(prisma, new Date()),
  });
}

/** Fiche d'un joueur, ou `null` s'il n'existe pas. */
export async function getPlayerDetail(
  prisma: PrismaClient,
  playerId: string,
): Promise<AdminPlayerDetail | null> {
  const [row] = await prisma.$queryRaw<
    { id: string; email: string | null; createdAt: Date }[]
  >`
    SELECT p.id, u.email::text AS email, p.created_at AS "createdAt"
    FROM players p JOIN auth.users u ON u.id = p.id
    WHERE p.id = ${playerId}::uuid`;
  if (!row) return null;

  const [snapshot, openings, lastOpening, adjustments] = await Promise.all([
    playerRepository(prisma, playerId).get(),
    prisma.boosterOpening.count({ where: { playerId } }),
    prisma.boosterOpening.findFirst({
      where: { playerId },
      orderBy: { openedAt: "desc" },
      select: { openedAt: true },
    }),
    prisma.adminAdjustment.findMany({
      where: { playerId },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  return {
    ...row,
    snapshot,
    openings,
    lastOpeningAt: lastOpening?.openedAt ?? null,
    adjustments,
  };
}

/**
 * Corrige les soldes d'un joueur, dans la même transaction verrouillée que
 * ses propres actions, et garde la trace de la correction.
 * Lève `NegativeBalanceError` si un solde passerait sous zéro.
 */
export async function adjustPlayer(
  prisma: PrismaClient,
  playerId: string,
  adjustment: Adjustment,
  adminEmail: string,
): Promise<void> {
  await createPrismaPlayerStore(prisma, playerId).update((record) => ({
    record: { ...record, wallet: applyAdjustment(record.wallet, adjustment) },
    result: undefined,
    events: [{ type: "admin-adjusted", adminEmail, adjustment }],
  }));
}

export interface GameStats {
  readonly players: number;
  readonly playersWithUsername: number;
  /** Joueurs ayant ouvert au moins un booster ces dernières 24 heures. */
  readonly activePlayers24h: number;
  readonly openings: number;
  readonly openings24h: number;
  /** Cartes tirées par rareté, depuis le début. */
  readonly drawnByRarity: Readonly<Record<Rarity, number>>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export async function gameStats(
  prisma: PrismaClient,
  now: Date,
): Promise<GameStats> {
  const since = new Date(now.getTime() - DAY_MS);
  const [players, playersWithUsername, recent, openings, rarities] =
    await Promise.all([
      prisma.player.count(),
      prisma.player.count({ where: { username: { not: null } } }),
      prisma.boosterOpening.groupBy({
        by: ["playerId"],
        where: { openedAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.boosterOpening.count(),
      prisma.$queryRaw<{ rarity: string; count: number }[]>`
        SELECT card->>'rarity' AS rarity, count(*)::int AS count
        FROM booster_openings, jsonb_array_elements(cards) AS card
        GROUP BY 1`,
    ]);

  const drawnByRarity = Object.fromEntries(
    RARITIES.map(({ id }) => [
      id,
      rarities.find((row) => row.rarity === id)?.count ?? 0,
    ]),
  ) as Record<Rarity, number>;

  return {
    players,
    playersWithUsername,
    activePlayers24h: recent.length,
    openings,
    openings24h: recent.reduce((total, row) => total + row._count._all, 0),
    drawnByRarity,
  };
}

export interface CatalogStatus {
  readonly catalog: number;
  readonly database: number;
  /** Clubs du catalogue absents de la base : un tirage pourrait échouer. */
  readonly missing: readonly string[];
  /** Clubs en base qui ne sont plus au catalogue (gardés s'ils sont possédés). */
  readonly extra: readonly string[];
  /** Clubs dont un champ diffère entre catalogue et base. */
  readonly outdated: readonly string[];
}

/** Écart entre le catalogue versionné et la table `clubs` (faut-il relancer le seed ?). */
export async function catalogStatus(
  prisma: PrismaClient,
): Promise<CatalogStatus> {
  const rows = await prisma.club.findMany();
  const inDatabase = new Map(rows.map((row) => [row.id, row]));
  const inCatalog = new Set(CLUB_CATALOG.map((club) => club.id));

  const outdated = CLUB_CATALOG.filter((club) => {
    const row = inDatabase.get(club.id);
    return (
      row !== undefined &&
      (row.name !== club.name ||
        row.city !== club.city ||
        row.department !== club.department ||
        row.division !== club.division ||
        row.colorPrimary !== club.colors.primary ||
        row.colorSecondary !== club.colors.secondary ||
        row.recentResults.join() !== club.recentResults.join())
    );
  }).map((club) => club.id);

  return {
    catalog: CLUB_CATALOG.length,
    database: rows.length,
    missing: CLUB_CATALOG.filter((club) => !inDatabase.has(club.id)).map(
      (club) => club.id,
    ),
    extra: rows.filter((row) => !inCatalog.has(row.id)).map((row) => row.id),
    outdated,
  };
}

export interface AdminGiveaway {
  readonly giveaway: Giveaway;
  readonly claims: number;
  readonly createdBy: string;
}

/** Tous les cadeaux, du plus récent au plus ancien, avec leur nombre de bénéficiaires. */
export async function listGiveaways(
  prisma: PrismaClient,
): Promise<AdminGiveaway[]> {
  const rows = await prisma.giveaway.findMany({
    orderBy: { startsAt: "desc" },
    include: { _count: { select: { claims: true } } },
  });
  return rows.map((row) => ({
    giveaway: toGiveaway(row),
    claims: row._count.claims,
    createdBy: row.createdBy,
  }));
}

export interface NewGiveaway {
  readonly title: string;
  readonly ingots: number;
  readonly boosters: number;
  readonly startsAt: number;
  readonly endsAt: number;
}

export async function createGiveaway(
  prisma: PrismaClient,
  giveaway: NewGiveaway,
  adminEmail: string,
): Promise<void> {
  await prisma.giveaway.create({
    data: {
      title: giveaway.title,
      ingots: giveaway.ingots,
      boosters: giveaway.boosters,
      startsAt: new Date(giveaway.startsAt),
      endsAt: new Date(giveaway.endsAt),
      createdBy: adminEmail,
    },
  });
}

/**
 * Arrête un cadeau tout de suite (ceux qui l'ont pris le gardent). Un cadeau
 * pas encore commencé est simplement supprimé.
 */
export async function endGiveaway(
  prisma: PrismaClient,
  giveawayId: string,
  now: Date,
): Promise<void> {
  const giveaway = await prisma.giveaway.findUnique({
    where: { id: giveawayId },
  });
  if (!giveaway || giveaway.endsAt <= now) return;
  if (giveaway.startsAt > now) {
    await prisma.giveaway.delete({ where: { id: giveawayId } });
    return;
  }
  await prisma.giveaway.update({
    where: { id: giveawayId },
    data: { endsAt: now },
  });
}

/** Jours d'historique lus pour la rétention et l'activité quotidienne. */
const ACTIVITY_WINDOW_DAYS = 60;

export interface ActivityData {
  /** Par joueur : jour d'inscription et jours de jeu (heure de Paris). */
  readonly players: readonly { signupDay: string; activeDays: Set<string> }[];
  /** Par jour : joueurs actifs et boosters ouverts. */
  readonly daily: readonly { day: string; players: number; openings: number }[];
}

/** Matière première des statistiques de rétention (jours à l'heure de Paris). */
export async function activityData(
  prisma: PrismaClient,
): Promise<ActivityData> {
  const [signups, active] = await Promise.all([
    prisma.$queryRaw<{ id: string; day: string }[]>`
      SELECT id, to_char(created_at AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD') AS day
      FROM players`,
    prisma.$queryRaw<{ playerId: string; day: string; openings: number }[]>`
      SELECT player_id AS "playerId",
             to_char(opened_at AT TIME ZONE 'Europe/Paris', 'YYYY-MM-DD') AS day,
             count(*)::int AS openings
      FROM booster_openings
      WHERE opened_at > now() - make_interval(days => ${ACTIVITY_WINDOW_DAYS})
      GROUP BY 1, 2`,
  ]);

  const daysByPlayer = new Map<string, Set<string>>();
  const daily = new Map<
    string,
    { day: string; players: number; openings: number }
  >();
  for (const row of active) {
    const days = daysByPlayer.get(row.playerId) ?? new Set<string>();
    days.add(row.day);
    daysByPlayer.set(row.playerId, days);
    const entry = daily.get(row.day) ?? {
      day: row.day,
      players: 0,
      openings: 0,
    };
    daily.set(row.day, {
      day: row.day,
      players: entry.players + 1,
      openings: entry.openings + row.openings,
    });
  }
  return {
    players: signups.map((row) => ({
      signupDay: row.day,
      activeDays: daysByPlayer.get(row.id) ?? new Set<string>(),
    })),
    daily: [...daily.values()],
  };
}

/** Efface le pseudo d'un joueur : il devra en choisir un autre à sa prochaine visite. */
export async function resetUsername(
  prisma: PrismaClient,
  playerId: string,
): Promise<void> {
  await prisma.player.updateMany({
    where: { id: playerId },
    data: { username: null },
  });
}
