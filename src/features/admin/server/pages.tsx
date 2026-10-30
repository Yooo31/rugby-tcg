import "server-only";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/empty-state";
import { RewardLabel } from "@/components/ui/reward";
import { adminData, type AdminSeason } from "@/data/server";
import {
  isGiveawayActive,
  isSeasonActive,
  type Season,
  ownedClubIds,
  RARITIES,
  RARITY_ODDS,
  totalCards,
  BOOSTER_REFILL_MS,
  INGOT_PACKS,
  VIP_GRANT_DAYS,
  VIP_OFFERS,
} from "@/domain";
import { toDayKey } from "@/lib/dates";
import { formatEuros } from "@/lib/money";
import { cn } from "@/lib/utils";
import { AdjustmentForm } from "../components/AdjustmentForm";
import { GiveawayForm } from "../components/GiveawayForm";
import { SeasonForm } from "../components/SeasonForm";
import { SentryTestButton } from "../components/SentryTestButton";
import { formatDateTime, formatDay, formatPercent } from "../lib/format";
import { lastDays, retention, RETENTION_DAYS } from "../lib/retention";
import {
  boostersPerWeek,
  closestScenario,
  monthIndicators,
  SCENARIOS,
} from "../lib/revenue";
import {
  endGiveawayAction,
  endSeasonAction,
  grantSeasonPassAction,
  grantVipAction,
  resetUsernameAction,
} from "./actions";
import { requireAdmin } from "./guard";

/** Chaque page revérifie les droits : le garde du layout n'est pas une barrière suffisante. */

function Section({
  title,
  children,
  className,
}: {
  readonly title: string;
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <section className={cn("panel flex flex-col gap-4 p-5", className)}>
      <h2 className="text-chalk-muted text-xl font-bold tracking-wider">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * Tableau de chiffres : première colonne à gauche, les autres alignées à
 * droite ; la dernière, secondaire, en gris.
 */
function DataTable({
  columns,
  rows,
}: {
  readonly columns: readonly string[];
  readonly rows: readonly {
    readonly key: string;
    readonly cells: readonly ReactNode[];
  }[];
}) {
  const align = (index: number) => (index === 0 ? "" : "text-right");
  return (
    <table className="w-full text-left text-sm tabular-nums">
      <thead className="text-chalk-muted">
        <tr>
          {columns.map((column, index) => (
            <th key={column} className={cn("py-2 font-medium", align(index))}>
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-line border-t">
            {row.cells.map((cell, index) => (
              <td
                key={columns[index]}
                className={cn(
                  "py-2",
                  align(index),
                  index === columns.length - 1 && "text-chalk-muted",
                )}
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Stat({
  label,
  value,
}: {
  readonly label: string;
  readonly value: ReactNode;
}) {
  return (
    <div className="bg-surface-raised rounded-control flex flex-col gap-1 p-4">
      <dt className="text-chalk-muted text-sm">{label}</dt>
      <dd className="font-display text-3xl font-bold tabular-nums">{value}</dd>
    </div>
  );
}

/** Jours d'activité affichés sur le tableau de bord. */
const ACTIVITY_DAYS_SHOWN = 14;

/** Données du tableau de bord, et l'heure de la requête (lue hors du rendu). */
async function loadDashboard() {
  const [stats, catalog, activity] = await Promise.all([
    adminData.gameStats(),
    adminData.catalogStatus(),
    adminData.activityData(),
  ]);
  const today = toDayKey(new Date());
  const days = Array.from({ length: ACTIVITY_DAYS_SHOWN }, (_, index) =>
    toDayKey(new Date(Date.now() - index * 24 * 60 * 60 * 1000)),
  );
  return {
    stats,
    catalog,
    retentions: RETENTION_DAYS.map((day) =>
      retention(activity.players, today, day),
    ),
    daily: lastDays(activity.daily, days),
  };
}

export async function AdminHomePage() {
  await requireAdmin();
  const { stats, catalog, retentions, daily } = await loadDashboard();
  const drawn = Object.values(stats.drawnByRarity).reduce((a, b) => a + b, 0);
  const catalogOk =
    catalog.missing.length === 0 && catalog.outdated.length === 0;

  return (
    <div className="flex flex-col gap-6">
      <Section title="Joueurs et ouvertures">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Joueurs inscrits" value={stats.players} />
          <Stat label="Avec pseudo" value={stats.playersWithUsername} />
          <Stat label="Actifs (24 h)" value={stats.activePlayers24h} />
          <Stat label="Boosters ouverts" value={stats.openings} />
          <Stat label="Ouverts (24 h)" value={stats.openings24h} />
        </dl>
      </Section>

      <Section title="Rétention">
        <p className="text-chalk-muted text-sm text-pretty">
          Part des joueurs revenus ouvrir un booster au moins n jours après leur
          inscription. Seuls comptent les joueurs inscrits depuis n jours.
        </p>
        <dl className="grid grid-cols-3 gap-3">
          {retentions.map((rate) => (
            <Stat
              key={rate.day}
              label={`J+${rate.day} (${rate.retained}/${rate.eligible})`}
              value={formatPercent(rate.retained, rate.eligible)}
            />
          ))}
        </dl>
      </Section>

      <Section title={`Activité (${ACTIVITY_DAYS_SHOWN} derniers jours)`}>
        <DataTable
          columns={["Jour", "Joueurs actifs", "Boosters", "Par joueur"]}
          rows={daily.map((entry) => ({
            key: entry.day,
            cells: [
              formatDay(entry.day),
              entry.players,
              entry.openings,
              entry.players === 0
                ? "–"
                : (entry.openings / entry.players).toFixed(1).replace(".", ","),
            ],
          }))}
        />
      </Section>

      <Section title="Raretés tirées">
        <p className="text-chalk-muted text-sm">
          {drawn} cartes tirées depuis le début. L&apos;écart avec les
          probabilités prévues se réduit avec le nombre de tirages.
        </p>
        <DataTable
          columns={["Rareté", "Cartes", "Observé", "Prévu"]}
          rows={RARITIES.map(({ id, label }) => ({
            key: id,
            cells: [
              label,
              stats.drawnByRarity[id],
              formatPercent(stats.drawnByRarity[id], drawn),
              formatPercent(RARITY_ODDS[id], 1),
            ],
          }))}
        />
      </Section>

      <Section title="Suivi des erreurs">
        <p className="text-chalk-muted text-sm text-pretty">
          Les erreurs du jeu sont envoyées à Sentry, sans donnée personnelle. Ce
          bouton en envoie une fausse pour vérifier que tout arrive.
        </p>
        <SentryTestButton />
      </Section>

      <Section title="Catalogue des clubs">
        <dl className="grid grid-cols-2 gap-3">
          <Stat label="Au catalogue" value={catalog.catalog} />
          <Stat label="En base" value={catalog.database} />
        </dl>
        {catalogOk ? (
          <p className="text-pitch text-sm">
            La base est à jour avec le catalogue.
          </p>
        ) : (
          <p role="alert" className="text-danger text-sm text-pretty">
            {catalog.missing.length} club(s) absent(s) de la base et{" "}
            {catalog.outdated.length} périmé(s) : lancer{" "}
            <code>pnpm db:seed</code>. Un tirage qui tombe sur un club absent
            échoue.
          </p>
        )}
        {catalog.extra.length > 0 ? (
          <p className="text-chalk-muted text-sm">
            {catalog.extra.length} club(s) en base ne sont plus au catalogue
            (gardés tant qu&apos;un joueur les possède).
          </p>
        ) : null}
        <ClubList title="Absents de la base" ids={catalog.missing} />
        <ClubList title="Périmés" ids={catalog.outdated} />
      </Section>
    </div>
  );
}

/** Nombre de clubs listés au plus dans un écart de catalogue. */
const MAX_LISTED_CLUBS = 20;

function ClubList({
  title,
  ids,
}: {
  readonly title: string;
  readonly ids: readonly string[];
}) {
  if (ids.length === 0) return null;
  return (
    <details className="text-sm">
      <summary className="cursor-pointer">{title}</summary>
      <p className="text-chalk-muted mt-2 break-words">
        {ids.slice(0, MAX_LISTED_CLUBS).join(", ")}
        {ids.length > MAX_LISTED_CLUBS ? "…" : ""}
      </p>
    </details>
  );
}

export async function AdminPlayersPage({
  searchParams,
}: {
  readonly searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireAdmin();
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.slice(0, 100) : "";
  const players = await adminData.searchPlayers(query);

  return (
    <div className="flex flex-col gap-4">
      <form className="flex gap-2" role="search">
        <label className="sr-only" htmlFor="admin-search">
          Pseudo ou adresse e-mail
        </label>
        <input
          id="admin-search"
          name="q"
          defaultValue={query}
          placeholder="Pseudo ou adresse e-mail"
          className="border-line-strong bg-night text-chalk rounded-control min-h-12 min-w-0 flex-1 border px-4"
        />
        <button
          type="submit"
          className="bg-pitch text-night rounded-control font-display min-h-12 px-5 font-bold uppercase"
        >
          Chercher
        </button>
      </form>

      {players.length === 0 ? (
        <EmptyState
          title="Personne"
          description="Aucun joueur ne correspond."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {players.map((player) => (
            <li key={player.id}>
              <Link
                href={`/admin/joueurs/${player.id}`}
                className="panel hover:border-line-strong flex min-h-14 flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 transition"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">
                    {player.username ?? (
                      <em className="text-chalk-muted">sans pseudo</em>
                    )}
                  </span>
                  <span className="text-chalk-muted block truncate text-sm">
                    {player.email}
                  </span>
                </span>
                <span className="text-chalk-muted text-sm tabular-nums">
                  {player.clubs} clubs · {player.ingots} lingots ·{" "}
                  {player.bonusBoosters} bonus
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export async function AdminPlayerPage({
  params,
}: {
  readonly params: Promise<{ playerId: string }>;
}) {
  await requireAdmin();
  const { playerId } = await params;
  const detail = /^[0-9a-f-]{36}$/i.test(playerId)
    ? await adminData.getPlayerDetail(playerId)
    : null;
  if (!detail) notFound();
  const { snapshot } = detail;

  return (
    <div className="flex flex-col gap-6">
      <Section title={snapshot.username ?? "Joueur sans pseudo"}>
        <p className="text-chalk-muted text-sm break-all">
          {detail.email} · inscrit le {formatDateTime(detail.createdAt)}
        </p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Lingots" value={snapshot.ingots} />
          <Stat label="Boosters bonus" value={snapshot.boosters.bonus} />
          <Stat
            label="Gratuits"
            value={`${snapshot.boosters.free}/${snapshot.boosters.max}`}
          />
          <Stat label="Clubs" value={ownedClubIds(snapshot.collection).size} />
          <Stat label="Cartes" value={totalCards(snapshot.collection)} />
          <Stat label="Boosters ouverts" value={detail.openings} />
        </dl>
        <p className="text-chalk-muted text-sm">
          Dernière ouverture :{" "}
          {detail.lastOpeningAt
            ? formatDateTime(detail.lastOpeningAt)
            : "jamais"}
          {" · "}albums récompensés : {snapshot.claimedAlbumIds.length}
        </p>
      </Section>

      {snapshot.username ? (
        <Section title="Pseudo">
          <p className="text-chalk-muted text-sm text-pretty">
            Pseudo inapproprié ? Réinitialisez-le : le joueur devra en choisir
            un autre à sa prochaine visite.
          </p>
          <form action={resetUsernameAction}>
            <input type="hidden" name="playerId" value={detail.id} />
            <button
              type="submit"
              className="border-line-strong rounded-control min-h-11 border px-4 text-sm font-medium"
            >
              Réinitialiser le pseudo « {snapshot.username} »
            </button>
          </form>
        </Section>
      ) : null}

      <Section title="Pass VIP">
        <p className="text-chalk-muted text-sm">
          {snapshot.vip.isActive && snapshot.vip.until !== null
            ? `VIP jusqu'au ${formatDateTime(new Date(snapshot.vip.until))}.`
            : "Pas VIP."}
        </p>
        <form action={grantVipAction}>
          <input type="hidden" name="playerId" value={detail.id} />
          <button
            type="submit"
            className="border-line-strong rounded-control min-h-11 border px-4 text-sm font-medium"
          >
            Offrir {VIP_GRANT_DAYS} jours de VIP
          </button>
        </form>
      </Section>

      {snapshot.season ? (
        <Section title="Passe de saison">
          <p className="text-chalk-muted text-sm">
            {snapshot.season.season.title} · palier {snapshot.season.tier} ·{" "}
            {snapshot.season.xp} points
          </p>
          {snapshot.season.hasPremium ? (
            <p className="text-sm">Voie payante : oui.</p>
          ) : (
            <form action={grantSeasonPassAction}>
              <input type="hidden" name="playerId" value={detail.id} />
              <input
                type="hidden"
                name="seasonId"
                value={snapshot.season.season.id}
              />
              <button
                type="submit"
                className="border-line-strong rounded-control min-h-11 border px-4 text-sm font-medium"
              >
                Donner la voie payante
              </button>
            </form>
          )}
        </Section>
      ) : null}

      <Section title="Corriger">
        <AdjustmentForm playerId={detail.id} />
      </Section>

      <Section title="Historique des corrections">
        {detail.adjustments.length === 0 ? (
          <p className="text-chalk-muted text-sm">Aucune correction.</p>
        ) : (
          <ul className="flex flex-col gap-3 text-sm">
            {detail.adjustments.map((adjustment) => (
              <li
                key={String(adjustment.id)}
                className="border-line border-t pt-3"
              >
                <p className="font-medium tabular-nums">
                  {signed(adjustment.ingotsDelta)} lingots,{" "}
                  {signed(adjustment.boostersDelta)} boosters
                </p>
                <p>{adjustment.reason}</p>
                <p className="text-chalk-muted">
                  {adjustment.adminEmail} ·{" "}
                  {formatDateTime(adjustment.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

const signed = (value: number) => (value > 0 ? `+${value}` : String(value));

/** Cadeaux et heure de la requête, lus hors du rendu (qui doit rester pur). */
async function loadGiveaways() {
  const giveaways = await adminData.listGiveaways();
  return { giveaways, now: Date.now() };
}

export async function AdminGiveawaysPage() {
  await requireAdmin();
  const { giveaways, now } = await loadGiveaways();

  return (
    <div className="flex flex-col gap-6">
      <Section title="Nouveau cadeau">
        <GiveawayForm today={toDayKey(new Date(now))} />
      </Section>

      <Section title="Cadeaux">
        {giveaways.length === 0 ? (
          <p className="text-chalk-muted text-sm">Aucun cadeau programmé.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {giveaways.map(({ giveaway, claims, createdBy }) => {
              const status = isGiveawayActive(giveaway, now)
                ? "En cours"
                : giveaway.startsAt > now
                  ? "À venir"
                  : "Terminé";
              return (
                <li
                  key={giveaway.id}
                  className="border-line flex flex-wrap items-center gap-3 border-t pt-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">
                      {giveaway.title}{" "}
                      <span
                        className={cn(
                          "text-sm",
                          status === "En cours"
                            ? "text-pitch"
                            : "text-chalk-muted",
                        )}
                      >
                        · {status}
                      </span>
                    </p>
                    <RewardLabel
                      reward={giveaway.reward}
                      className="text-base"
                    />
                    <p className="text-chalk-muted text-sm">
                      Du {formatDateTime(giveaway.startsAt)} au{" "}
                      {formatDateTime(giveaway.endsAt)} · {claims} récupéré(s) ·{" "}
                      {createdBy}
                    </p>
                  </div>
                  {status !== "Terminé" ? (
                    <form action={endGiveawayAction}>
                      <input
                        type="hidden"
                        name="giveawayId"
                        value={giveaway.id}
                      />
                      <button
                        type="submit"
                        className="border-line-strong rounded-control min-h-11 border px-4 text-sm font-medium"
                      >
                        {status === "À venir" ? "Annuler" : "Arrêter"}
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

/** Huit semaines, durée conseillée d'une saison. */
const SEASON_DEFAULT_DAYS = 56;
const DAY_MS = 24 * 60 * 60 * 1000;

/** Saisons et heure de la requête, lues hors du rendu (qui doit rester pur). */
async function loadSeasons() {
  const seasons = await adminData.listSeasons();
  return { seasons, now: Date.now() };
}

export async function AdminSeasonsPage() {
  await requireAdmin();
  const { seasons, now } = await loadSeasons();

  return (
    <div className="flex flex-col gap-6">
      <Section title="Nouvelle saison">
        <SeasonForm
          today={toDayKey(new Date(now))}
          inEightWeeks={toDayKey(
            new Date(now + (SEASON_DEFAULT_DAYS - 1) * DAY_MS),
          )}
        />
      </Section>

      <Section title="Saisons">
        {seasons.length === 0 ? (
          <p className="text-chalk-muted text-sm">Aucune saison programmée.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {seasons.map((entry) => (
              <SeasonRow key={entry.season.id} entry={entry} now={now} />
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

type PeriodStatus = "En cours" | "À venir" | "Terminée";

function seasonStatus(season: Season, now: number): PeriodStatus {
  if (isSeasonActive(season, now)) return "En cours";
  return season.startsAt > now ? "À venir" : "Terminée";
}

function SeasonRow({
  entry: { season, passes, createdBy },
  now,
}: {
  readonly entry: AdminSeason;
  readonly now: number;
}) {
  const status = seasonStatus(season, now);
  return (
    <li className="border-line flex flex-wrap items-center gap-3 border-t pt-3">
      <div className="min-w-0 flex-1">
        <p className="font-medium">
          {season.title}{" "}
          <span
            className={cn(
              "text-sm",
              status === "En cours" ? "text-pitch" : "text-chalk-muted",
            )}
          >
            · {status}
          </span>
        </p>
        <p className="text-chalk-muted text-sm">
          Du {formatDateTime(season.startsAt)} au{" "}
          {formatDateTime(season.endsAt)} · {passes} voie(s) payante(s) ·{" "}
          {createdBy}
        </p>
      </div>
      {status !== "Terminée" ? (
        <form action={endSeasonAction}>
          <input type="hidden" name="seasonId" value={season.id} />
          <button
            type="submit"
            className="border-line-strong rounded-control min-h-11 border px-4 text-sm font-medium"
          >
            {status === "À venir" ? "Annuler" : "Arrêter"}
          </button>
        </form>
      ) : null}
    </li>
  );
}

/** Libellés des produits vendus, dans le tableau des ventes. */
const SALE_LABELS: Record<string, string> = {
  ...Object.fromEntries(
    INGOT_PACKS.map((pack) => [
      `ingots:${pack.id}`,
      `${pack.label} (${pack.ingots} lingots)`,
    ]),
  ),
  ...Object.fromEntries(
    VIP_OFFERS.map((offer) => [
      `vip:${offer.id}`,
      `VIP, ${offer.label.toLowerCase()}`,
    ]),
  ),
  "season-pass:season-pass": "Voie payante de saison",
};

/** Boosters gratuits au plus par semaine : un toutes les `BOOSTER_REFILL_MS`. */
const MAX_FREE_BOOSTERS_PER_WEEK = Math.floor(
  (7 * 24 * 60 * 60 * 1000) / BOOSTER_REFILL_MS,
);

const COUNT = new Intl.NumberFormat("fr-FR");
const formatCount = (value: number) => COUNT.format(value);

const percent = (value: number | null) =>
  value === null ? "–" : formatPercent(value, 1);
const euros = (cents: number | null) =>
  cents === null ? "–" : formatEuros(cents);

/** Indicateurs de revenu (docs/economie.md, sections 6 bis et 7). */
export async function AdminRevenuePage() {
  await requireAdmin();
  const [data, activity] = await Promise.all([
    adminData.revenueData(),
    adminData.activityData(),
  ]);
  const [current, previous] = data.months;
  if (!current || !previous) notFound();
  const now = monthIndicators(current);
  const before = monthIndicators(previous);
  const scenario = closestScenario(now.arpuCents);
  const vipShare =
    current.activePlayers === 0 ? null : data.activeVip / current.activePlayers;
  const today = toDayKey(new Date());
  const payers = activity.players.filter(({ id }) => data.payerIds.has(id));
  const free = activity.players.filter(({ id }) => !data.payerIds.has(id));
  const perWeek = boostersPerWeek(data.freeRhythm);

  return (
    <div className="flex flex-col gap-6">
      <Section title={`Revenu du mois (${current.key})`}>
        <p className="text-chalk-muted text-sm text-pretty">
          Achats non remboursés. Net : moins les frais Stripe estimés (1,5 % +
          0,25 € par paiement) ; TVA non applicable en micro-entreprise. Mois
          précédent ({previous.key}) entre parenthèses.
        </p>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat
            label={`Brut (${euros(before.grossCents)})`}
            value={euros(now.grossCents)}
          />
          <Stat
            label={`Net (${euros(before.netCents)})`}
            value={euros(now.netCents)}
          />
          <Stat label={`Achats (${before.purchases})`} value={now.purchases} />
          <Stat
            label={`Joueurs actifs (${previous.activePlayers})`}
            value={current.activePlayers}
          />
          <Stat label={`Payeurs (${previous.payers})`} value={current.payers} />
          <Stat
            label={`Conversion (${percent(before.conversion)})`}
            value={percent(now.conversion)}
          />
          <Stat
            label={`Net par joueur actif (${euros(before.arpuCents)})`}
            value={euros(now.arpuCents)}
          />
          <Stat
            label={`Net par payeur (${euros(before.arppuCents)})`}
            value={euros(now.arppuCents)}
          />
          <Stat
            label={`Remboursements et litiges (${previous.refunds.count})`}
            value={`${current.refunds.count} · ${euros(current.refunds.cents)}`}
          />
        </dl>
      </Section>

      <Section title="Scénarios de economie.md">
        <p className="text-chalk-muted text-sm text-pretty">
          Comparés aux chiffres du mois en cours.{" "}
          {scenario
            ? `Le revenu par joueur actif est le plus proche du scénario « ${scenario.label} ».`
            : "Pas encore de joueur actif ce mois-ci."}
        </p>
        <DataTable
          columns={["", "VIP", "Acheteurs de lingots", "Net par joueur actif"]}
          rows={[
            ...SCENARIOS.map((entry) => ({
              key: entry.id,
              cells: [
                entry.label,
                percent(entry.vipShare),
                percent(entry.ingotBuyersShare),
                euros(entry.arpuCents),
              ],
            })),
            {
              key: "reel",
              cells: [
                <strong key="label">Réel</strong>,
                percent(vipShare),
                percent(now.ingotBuyersShare),
                euros(now.arpuCents),
              ],
            },
          ]}
        />
      </Section>

      <Section title="Pass VIP">
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="VIP payants en ce moment" value={data.activeVip} />
          <Stat label="Revenu récurrent mensuel" value={euros(data.mrrCents)} />
          <Stat
            label={`Nouveaux (${previous.newVip})`}
            value={current.newVip}
          />
          <Stat
            label={`Non renouvelés (sur ${current.vipAtStart} au 1er)`}
            value={current.vipLost}
          />
          <Stat
            label={`Taux de départ (${percent(before.vipChurn)})`}
            value={percent(now.vipChurn)}
          />
        </dl>
      </Section>

      <Section title="Ventes du mois">
        {current.sales.length === 0 ? (
          <p className="text-chalk-muted text-sm">Aucune vente ce mois-ci.</p>
        ) : (
          <DataTable
            columns={["Produit", "Ventes", "Brut"]}
            rows={current.sales.map((line) => ({
              key: `${line.kind}:${line.item}`,
              cells: [
                SALE_LABELS[`${line.kind}:${line.item}`] ?? line.item,
                line.count,
                euros(line.cents),
              ],
            }))}
          />
        )}
      </Section>

      <Section title="Lingots du mois">
        <p className="text-chalk-muted text-sm text-pretty">
          Gagnés : missions, albums, série, saison et cadeaux. Dépensés :
          boosters et cosmétiques. Compteur tenu depuis l&apos;arrivée de cet
          écran.
        </p>
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat label="Achetés" value={formatCount(current.ingotsBought)} />
          <Stat label="Gagnés" value={formatCount(current.ingotsEarned)} />
          <Stat label="Dépensés" value={formatCount(current.ingotsSpent)} />
        </dl>
      </Section>

      <Section title="Rétention : payeurs et gratuits">
        <DataTable
          columns={["", ...RETENTION_DAYS.map((day) => `J+${day}`)]}
          rows={[
            {
              key: "payeurs",
              label: `Payeurs (${payers.length})`,
              players: payers,
            },
            {
              key: "gratuits",
              label: `Gratuits (${free.length})`,
              players: free,
            },
          ].map(({ key, label, players }) => ({
            key,
            cells: [
              label,
              ...RETENTION_DAYS.map((day) => {
                const rate = retention(players, today, day);
                return formatPercent(rate.retained, rate.eligible);
              }),
            ],
          }))}
        />
      </Section>

      <Section title="Rythme des joueurs gratuits">
        <p className="text-chalk-muted text-sm text-pretty">
          Boosters gratuits ouverts par joueur gratuit actif et par semaine, sur
          les {data.freeRhythm.days} derniers jours ({data.freeRhythm.players}{" "}
          joueurs). Le jeu gratuit en permet {MAX_FREE_BOOSTERS_PER_WEEK} au
          plus, hors récompenses.
        </p>
        <dl className="grid grid-cols-2 gap-3">
          <Stat
            label="Boosters par semaine"
            value={
              perWeek === null ? "–" : perWeek.toFixed(1).replace(".", ",")
            }
          />
          <Stat
            label="Part du maximum gratuit"
            value={
              perWeek === null
                ? "–"
                : formatPercent(perWeek, MAX_FREE_BOOSTERS_PER_WEEK)
            }
          />
        </dl>
      </Section>
    </div>
  );
}
