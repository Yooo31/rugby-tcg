import { z } from "zod";
import { PREMIUM_MAX_FREE_BOOSTERS } from "./booster";
import {
  RewardNotClaimableError,
  type Reward,
  type RewardStatus,
} from "./reward";

/**
 * Pass VIP (voir docs/economie.md, section 3.1) : une réserve de boosters
 * gratuits plus grande, un booster VIP par jour, deux missions de plus, un
 * badge. Le statut se vérifie côté serveur, d'après des périodes d'adhésion
 * (achat, ou don de l'administration pour les tests).
 */
export const VIP_OFFERS = [
  { id: "vip-month", label: "Un mois", days: 30, priceCents: 599 },
  { id: "vip-year", label: "Un an", days: 365, priceCents: 4_999 },
] as const;

export type VipOffer = (typeof VIP_OFFERS)[number];

/** Réserve de boosters gratuits d'un VIP. */
export const VIP_MAX_FREE_BOOSTERS = PREMIUM_MAX_FREE_BOOSTERS;

/** Booster VIP du jour. */
const VIP_DAILY_REWARD: Reward = { ingots: 0, boosters: 1 };

/** Jours offerts par l'administration (tests, geste commercial). */
export const VIP_GRANT_DAYS = 30;

/** Une période d'adhésion : début inclus, fin exclue (millisecondes Unix). */
export const vipMembershipSchema = z.object({
  startsAt: z.number(),
  endsAt: z.number(),
});

export type VipMembership = z.infer<typeof vipMembershipSchema>;

/** Fin de l'adhésion en cours, ou `null` si le joueur n'est pas VIP. */
export function vipUntil(
  memberships: readonly VipMembership[],
  now: number,
): number | null {
  const current = memberships.filter(
    ({ startsAt, endsAt }) => startsAt <= now && now < endsAt,
  );
  return current.length > 0
    ? Math.max(...current.map(({ endsAt }) => endsAt))
    : null;
}

/** Statut VIP du joueur, vu par lui. */
export interface VipStatus {
  readonly isActive: boolean;
  /** Fin de l'adhésion en cours. */
  readonly until: number | null;
  /** Booster VIP du jour : verrouillé sans VIP, puis à prendre ou pris. */
  readonly dailyBooster: RewardStatus;
}

export function vipStatus(
  memberships: readonly VipMembership[],
  lastBoosterDay: string | null,
  today: string,
  now: number,
): VipStatus {
  const until = vipUntil(memberships, now);
  const isActive = until !== null;
  return {
    isActive,
    until,
    dailyBooster: !isActive
      ? "locked"
      : lastBoosterDay === today
        ? "claimed"
        : "claimable",
  };
}

/** Récupère le booster VIP du jour ; erreur hors VIP ou s'il est déjà pris. */
export function claimVipBooster(
  memberships: readonly VipMembership[],
  lastBoosterDay: string | null,
  today: string,
  now: number,
): { readonly day: string; readonly reward: Reward } {
  const status = vipStatus(memberships, lastBoosterDay, today, now);
  if (status.dailyBooster !== "claimable") throw new RewardNotClaimableError();
  return { day: today, reward: VIP_DAILY_REWARD };
}
