import { z } from "zod";

/** Ce que rapporte une mission ou un album terminé. */
export const rewardSchema = z.object({
  ingots: z.number().int().min(0),
  boosters: z.number().int().min(0),
});

export type Reward = z.infer<typeof rewardSchema>;

/** État d'une récompense : pas encore gagnée, à récupérer, déjà récupérée. */
export type RewardStatus = "locked" | "claimable" | "claimed";

export class RewardNotClaimableError extends Error {
  constructor() {
    super("Cette récompense n'est pas disponible.");
    this.name = "RewardNotClaimableError";
  }
}
