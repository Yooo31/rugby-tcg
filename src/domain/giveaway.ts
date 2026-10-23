import { z } from "zod";
import {
  RewardNotClaimableError,
  rewardSchema,
  type Reward,
  type RewardStatus,
} from "./reward";

/**
 * Cadeau offert à tous les joueurs pendant une période (« pour toute connexion
 * le 23/10, un booster offert »). Comme toute récompense, il se récupère par
 * un geste du joueur, une seule fois, et seulement pendant la période.
 */
export const giveawaySchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(80),
  reward: rewardSchema.refine(
    (reward) => reward.ingots + reward.boosters > 0,
    "Un cadeau doit offrir des lingots ou des boosters.",
  ),
  /** Début inclus et fin exclue, en millisecondes Unix. */
  startsAt: z.number(),
  endsAt: z.number(),
});

export type Giveaway = z.infer<typeof giveawaySchema>;

export function isGiveawayActive(giveaway: Giveaway, now: number): boolean {
  return giveaway.startsAt <= now && now < giveaway.endsAt;
}

/** Un cadeau en cours, vu par le joueur. */
export interface GiveawayProgress {
  readonly giveaway: Giveaway;
  readonly status: Exclude<RewardStatus, "locked">;
}

/** Cadeaux en cours et leur état pour ce joueur. */
export function giveawayProgress(
  giveaways: readonly Giveaway[],
  claimedIds: readonly string[],
  now: number,
): GiveawayProgress[] {
  return giveaways
    .filter((giveaway) => isGiveawayActive(giveaway, now))
    .map((giveaway) => ({
      giveaway,
      status: claimedIds.includes(giveaway.id) ? "claimed" : "claimable",
    }));
}

/** Récompense d'un cadeau à récupérer ; erreur s'il est fini, à venir ou déjà pris. */
export function claimGiveaway(
  giveaways: readonly Giveaway[],
  giveawayId: string,
  claimedIds: readonly string[],
  now: number,
): Reward {
  const entry = giveawayProgress(giveaways, claimedIds, now).find(
    ({ giveaway }) => giveaway.id === giveawayId,
  );
  if (entry?.status !== "claimable") throw new RewardNotClaimableError();
  return entry.giveaway.reward;
}
