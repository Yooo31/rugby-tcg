/**
 * Indicateurs de revenu, calculés à partir des agrégats lus en base
 * (docs/economie.md, sections 6 bis et 7). Les montants sont en centimes.
 */

/** Frais Stripe estimés par paiement, carte européenne (docs/economie.md, section 5). */
const STRIPE_PERCENT = 0.015;
const STRIPE_FIXED_CENTS = 25;

/** Les chiffres d'un mois dont les indicateurs ont besoin. */
export interface MonthInput {
  readonly activePlayers: number;
  readonly payers: number;
  readonly ingotBuyers: number;
  readonly sales: readonly { readonly count: number; readonly cents: number }[];
  readonly vipAtStart: number;
  readonly vipLost: number;
}

export interface MonthIndicators {
  readonly grossCents: number;
  /** Net des frais Stripe estimés (TVA non applicable en micro-entreprise). */
  readonly netCents: number;
  readonly purchases: number;
  /** Part des joueurs actifs qui ont payé ; `null` sans joueur actif. */
  readonly conversion: number | null;
  readonly ingotBuyersShare: number | null;
  /** Revenu net par joueur actif et par payeur. */
  readonly arpuCents: number | null;
  readonly arppuCents: number | null;
  /** Part des VIP du début du mois qui ne le sont plus. */
  readonly vipChurn: number | null;
}

const ratio = (part: number, total: number): number | null =>
  total === 0 ? null : part / total;

export function monthIndicators(month: MonthInput): MonthIndicators {
  const grossCents = month.sales.reduce((total, line) => total + line.cents, 0);
  const purchases = month.sales.reduce((total, line) => total + line.count, 0);
  const netCents = Math.round(
    grossCents * (1 - STRIPE_PERCENT) - purchases * STRIPE_FIXED_CENTS,
  );
  const perActive = ratio(netCents, month.activePlayers);
  const perPayer = ratio(netCents, month.payers);
  return {
    grossCents,
    netCents,
    purchases,
    conversion: ratio(month.payers, month.activePlayers),
    ingotBuyersShare: ratio(month.ingotBuyers, month.activePlayers),
    arpuCents: perActive === null ? null : Math.round(perActive),
    arppuCents: perPayer === null ? null : Math.round(perPayer),
    vipChurn: ratio(month.vipLost, month.vipAtStart),
  };
}

/** Scénarios de docs/economie.md (section 6 bis), par joueur actif et par mois. */
export const SCENARIOS = [
  {
    id: "prudent",
    label: "Prudent",
    vipShare: 0.01,
    ingotBuyersShare: 0.005,
    arpuCents: 7,
  },
  {
    id: "median",
    label: "Médian",
    vipShare: 0.025,
    ingotBuyersShare: 0.015,
    arpuCents: 22,
  },
  {
    id: "favorable",
    label: "Favorable",
    vipShare: 0.04,
    ingotBuyersShare: 0.03,
    arpuCents: 47,
  },
] as const;

/** Le scénario le plus proche du revenu net réel par joueur actif. */
export function closestScenario(
  arpuCents: number | null,
): (typeof SCENARIOS)[number] | null {
  if (arpuCents === null) return null;
  return SCENARIOS.reduce((best, scenario) =>
    Math.abs(scenario.arpuCents - arpuCents) <
    Math.abs(best.arpuCents - arpuCents)
      ? scenario
      : best,
  );
}

/** Boosters ouverts par joueur gratuit actif et par semaine. */
export function boostersPerWeek(rhythm: {
  readonly days: number;
  readonly openings: number;
  readonly players: number;
}): number | null {
  if (rhythm.players === 0 || rhythm.days === 0) return null;
  return (rhythm.openings / rhythm.players) * (7 / rhythm.days);
}
