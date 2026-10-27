import {
  getDivision,
  IS_RECENT_FORM_SHOWN,
  type Club,
  type MatchResult,
} from "./club";

/** Puissance d'un club de Régionale 3 sans forme particulière. */
const BASE_POWER_LOWEST_TIER = 24;
/** Écart de puissance entre deux divisions consécutives. */
const POWER_STEP_PER_TIER = 7;
const LOWEST_TIER = 10;

const FORM_POINTS: Record<MatchResult, number> = { W: 1, D: 0, L: -1 };

const MIN_POWER = 1;
export const MAX_POWER = 99;

/** Bonus ou malus de forme : +1 par victoire, −1 par défaite sur les derniers matchs. */
export function formBonus(results: readonly MatchResult[]): number {
  return results.reduce((total, result) => total + FORM_POINTS[result], 0);
}

/**
 * Score de puissance : dépend uniquement du niveau sportif (division, plus la
 * forme quand elle est affichée, voir `IS_RECENT_FORM_SHOWN`).
 * Il est volontairement indépendant de la rareté de la carte.
 */
export function computePower(
  club: Pick<Club, "division" | "recentResults">,
  { withForm = IS_RECENT_FORM_SHOWN }: { readonly withForm?: boolean } = {},
): number {
  const { tier } = getDivision(club.division);
  const base =
    BASE_POWER_LOWEST_TIER + (LOWEST_TIER - tier) * POWER_STEP_PER_TIER;
  const power = base + (withForm ? formBonus(club.recentResults) : 0);
  return Math.min(MAX_POWER, Math.max(MIN_POWER, power));
}
