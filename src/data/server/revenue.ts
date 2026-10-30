import "server-only";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";

/**
 * Indicateurs de revenu de l'administration (docs/economie.md, section 7).
 * Tout est agrégé en SQL : aucune donnée de joueur ne sort d'ici, sauf
 * l'appartenance aux payeurs pour découper la rétention.
 */

/** Tous les achats payés, quelle que soit leur sorte (SQL constant). */
const PURCHASES = Prisma.raw(`
  SELECT player_id, 'ingots' AS kind, pack_id AS item, price_cents,
         created_at, refunded_at
  FROM ingot_purchases
  UNION ALL
  SELECT player_id, 'vip', offer_id, price_cents, created_at, refunded_at
  FROM vip_memberships WHERE reference IS NOT NULL
  UNION ALL
  SELECT player_id, 'season-pass', 'season-pass', price_cents, created_at, refunded_at
  FROM season_passes WHERE reference IS NOT NULL`);

export interface SalesLine {
  readonly kind: string;
  readonly item: string;
  readonly count: number;
  readonly cents: number;
}

/** Chiffres d'un mois (heure de Paris). */
export interface MonthFigures {
  readonly key: string;
  /** Joueurs ayant ouvert au moins un booster dans le mois. */
  readonly activePlayers: number;
  /** Joueurs ayant payé dans le mois (achats non remboursés). */
  readonly payers: number;
  /** Payeurs de lingots seulement (pour comparer aux scénarios). */
  readonly ingotBuyers: number;
  readonly sales: readonly SalesLine[];
  readonly refunds: { readonly count: number; readonly cents: number };
  /** Joueurs dont le premier pass VIP payé date de ce mois. */
  readonly newVip: number;
  /** VIP payants au début du mois, et parmi eux ceux qui ne le sont plus. */
  readonly vipAtStart: number;
  readonly vipLost: number;
  /** Lingots gagnés et dépensés dans le jeu, et achetés. */
  readonly ingotsEarned: number;
  readonly ingotsSpent: number;
  readonly ingotsBought: number;
}

export interface RevenueData {
  readonly months: readonly MonthFigures[];
  /** Revenu récurrent mensuel : chaque pass VIP payé en cours, ramené au mois. */
  readonly mrrCents: number;
  /** VIP payants en ce moment. */
  readonly activeVip: number;
  /** Joueurs ayant payé au moins une fois (pour la rétention). */
  readonly payerIds: ReadonlySet<string>;
  /** Boosters gratuits ouverts par les joueurs gratuits sur la fenêtre, et combien d'entre eux. */
  readonly freeRhythm: {
    readonly days: number;
    readonly openings: number;
    readonly players: number;
  };
}

/** Une requête d'agrégat sans GROUP BY renvoie toujours une seule ligne. */
function single<T>(rows: readonly T[]): T {
  const [row] = rows;
  if (!row) throw new Error("Agrégat sans ligne.");
  return row;
}

interface Month {
  readonly key: string;
  readonly start: Date;
  readonly end: Date;
}

/** Jours sur lesquels mesurer le rythme des joueurs gratuits. */
const FREE_RHYTHM_DAYS = 28;

async function monthFigures(
  prisma: PrismaClient,
  { key, start, end }: Month,
  now: Date,
): Promise<MonthFigures> {
  const until = end < now ? end : now;
  const active = single(
    await prisma.$queryRaw<{ count: number }[]>`
    SELECT count(DISTINCT player_id)::int AS count FROM booster_openings
    WHERE opened_at >= ${start} AND opened_at < ${end}`,
  );
  const sales = await prisma.$queryRaw<
    SalesLine[]
  >`SELECT kind, item, count(*)::int AS count, sum(price_cents)::int AS cents
     FROM (${PURCHASES}) p
     WHERE created_at >= ${start} AND created_at < ${end} AND refunded_at IS NULL
     GROUP BY kind, item ORDER BY kind, item`;
  const payers = single(
    await prisma.$queryRaw<
      { payers: number; ingots: number }[]
    >`SELECT count(DISTINCT player_id)::int AS payers,
            count(DISTINCT player_id) FILTER (WHERE kind = 'ingots')::int AS ingots
     FROM (${PURCHASES}) p
     WHERE created_at >= ${start} AND created_at < ${end} AND refunded_at IS NULL`,
  );
  const refunds = single(
    await prisma.$queryRaw<
      { count: number; cents: number }[]
    >`SELECT count(*)::int AS count, coalesce(sum(price_cents), 0)::int AS cents
     FROM (${PURCHASES}) p
     WHERE refunded_at >= ${start} AND refunded_at < ${end}`,
  );
  const vip = single(
    await prisma.$queryRaw<{ newVip: number; atStart: number; lost: number }[]>`
    WITH paid AS (
      SELECT player_id, starts_at, ends_at, created_at FROM vip_memberships
      WHERE reference IS NOT NULL AND refunded_at IS NULL
    ),
    at_start AS (
      SELECT DISTINCT player_id FROM paid
      WHERE starts_at <= ${start} AND ${start} < ends_at
    )
    SELECT
      (SELECT count(*)::int FROM (
         SELECT player_id FROM paid GROUP BY player_id
         HAVING min(created_at) >= ${start} AND min(created_at) < ${end}
       ) n) AS "newVip",
      (SELECT count(*)::int FROM at_start) AS "atStart",
      (SELECT count(*)::int FROM at_start s WHERE NOT EXISTS (
         SELECT 1 FROM vip_memberships v
         WHERE v.player_id = s.player_id AND v.refunded_at IS NULL
           AND v.starts_at <= ${until} AND ${until} < v.ends_at
       )) AS lost`,
  );
  const flows = single(
    await prisma.$queryRaw<{ earned: number; spent: number }[]>`
    SELECT coalesce(sum(earned), 0)::int AS earned,
           coalesce(sum(spent), 0)::int AS spent
    FROM ingot_flows WHERE day LIKE ${`${key}-%`}`,
  );
  const bought = single(
    await prisma.$queryRaw<{ ingots: number }[]>`
    SELECT coalesce(sum(ingots), 0)::int AS ingots FROM ingot_purchases
    WHERE created_at >= ${start} AND created_at < ${end} AND refunded_at IS NULL`,
  );

  return {
    key,
    activePlayers: active.count,
    payers: payers.payers,
    ingotBuyers: payers.ingots,
    sales,
    refunds,
    newVip: vip.newVip,
    vipAtStart: vip.atStart,
    vipLost: vip.lost,
    ingotsEarned: flows.earned,
    ingotsSpent: flows.spent,
    ingotsBought: bought.ingots,
  };
}

/** Indicateurs des mois demandés (le plus récent d'abord) et de l'instant. */
export async function revenueData(
  prisma: PrismaClient,
  months: readonly Month[],
  now: Date,
): Promise<RevenueData> {
  const figures: MonthFigures[] = [];
  for (const month of months)
    figures.push(await monthFigures(prisma, month, now));

  const vip = single(
    await prisma.$queryRaw<{ mrr: number; active: number }[]>`
    SELECT
      coalesce(round(sum(
        price_cents * 30.0 / greatest(1, extract(epoch FROM ends_at - starts_at) / 86400)
      )), 0)::int AS mrr,
      count(DISTINCT player_id)::int AS active
    FROM vip_memberships
    WHERE reference IS NOT NULL AND refunded_at IS NULL
      AND starts_at <= ${now} AND ${now} < ends_at`,
  );
  const payers = await prisma.$queryRaw<
    { playerId: string }[]
  >`SELECT DISTINCT player_id AS "playerId" FROM (${PURCHASES}) p
     WHERE refunded_at IS NULL`;
  const payerIds = new Set(payers.map(({ playerId }) => playerId));
  const since = new Date(
    now.getTime() - FREE_RHYTHM_DAYS * 24 * 60 * 60 * 1000,
  );
  const rhythm = single(
    await prisma.$queryRaw<
      { openings: number; players: number }[]
    >`SELECT count(*)::int AS openings, count(DISTINCT player_id)::int AS players
     FROM booster_openings b
     WHERE opened_at >= ${since} AND opened_at < ${now} AND source = 'free'
       AND NOT EXISTS (
         SELECT 1 FROM (${PURCHASES}) p
         WHERE p.player_id = b.player_id AND p.refunded_at IS NULL
       )`,
  );

  return {
    months: figures,
    mrrCents: vip.mrr,
    activeVip: vip.active,
    payerIds,
    freeRhythm: {
      days: FREE_RHYTHM_DAYS,
      openings: rhythm.openings,
      players: rhythm.players,
    },
  };
}
