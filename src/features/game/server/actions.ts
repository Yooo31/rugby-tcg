"use server";

import type { z } from "zod";
import type {
  BoosterOpening,
  LeaderboardRepository,
  PlayerRepository,
} from "@/data";
import {
  createServerLeaderboard,
  createServerPlayerRepository,
  createServerRateLimiter,
  referralData,
} from "@/data/server";
import {
  cosmeticIdSchema,
  seasonTrackSchema,
  usernameSchema,
  type Leaderboard,
  type PlayerSnapshot,
  type SeasonTrack,
} from "@/domain";
import { requireAuthUser } from "@/features/auth/server";
import {
  gameErrorCode,
  InvalidGameRequestError,
  RateLimitedError,
  type ActionResult,
} from "../lib/action-result";
import {
  ACTION_WINDOW_MS,
  ACTIONS_PER_WINDOW,
  giveawayIdSchema,
  leaderboardRegionSchema,
  offerIdSchema,
  rewardIdSchema,
  seasonTierSchema,
} from "../lib/inputs";

/**
 * Actions du joueur, arbitrées par le serveur. Chacune est un point d'entrée
 * public : l'identité vient de la session vérifiée, tout paramètre reçu du
 * navigateur est validé avant usage, et le débit est limité par joueur.
 */

const limiter = createServerRateLimiter({
  limit: ACTIONS_PER_WINDOW,
  windowMs: ACTION_WINDOW_MS,
});

interface PlayerContext {
  readonly userId: string;
  readonly player: PlayerRepository;
  readonly leaderboard: LeaderboardRepository;
}

async function run<T>(
  work: (context: PlayerContext) => Promise<T>,
): Promise<ActionResult<T>> {
  // Hors du `try` : sans session, `requireAuthUser` redirige vers la connexion.
  const user = await requireAuthUser();
  try {
    if (!(await limiter.take(`game:${user.id}`))) throw new RateLimitedError();
    return {
      ok: true,
      value: await work({
        userId: user.id,
        player: createServerPlayerRepository(user.id),
        leaderboard: createServerLeaderboard(user.id),
      }),
    };
  } catch (error) {
    const code = gameErrorCode(error);
    if (code) return { ok: false, error: code };
    throw error;
  }
}

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const parsed = schema.safeParse(value);
  if (!parsed.success) throw new InvalidGameRequestError();
  return parsed.data;
}

export async function getPlayer(): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) => player.get());
}

export async function openBooster(): Promise<ActionResult<BoosterOpening>> {
  return run(async ({ player, userId }) => {
    const opening = await player.openBooster();
    // Le parrainage ne doit jamais faire échouer l'ouverture : il sera
    // retenté à la prochaine.
    await referralData.settle(userId).catch((error: unknown) => {
      console.error("Récompense de parrainage reportée", error);
    });
    return opening;
  });
}

export async function buyBoosters(
  offerId: unknown,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) => player.buyBoosters(parse(offerIdSchema, offerId)));
}

export async function claimMission(
  missionId: unknown,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) =>
    player.claimMission(parse(rewardIdSchema, missionId)),
  );
}

export async function claimAlbumReward(
  albumId: unknown,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) =>
    player.claimAlbumReward(parse(rewardIdSchema, albumId)),
  );
}

export async function claimGiveaway(
  giveawayId: unknown,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) =>
    player.claimGiveaway(parse(giveawayIdSchema, giveawayId)),
  );
}

export async function claimSeasonTier(
  tier: number,
  track: SeasonTrack,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) =>
    player.claimSeasonTier(
      parse(seasonTierSchema, tier),
      parse(seasonTrackSchema, track),
    ),
  );
}

export async function claimStreak(): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) => player.claimStreak());
}

export async function claimVipBooster(): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) => player.claimVipBooster());
}

export async function buyCosmetic(
  cosmeticId: unknown,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) =>
    player.buyCosmetic(parse(cosmeticIdSchema, cosmeticId)),
  );
}

export async function equipCosmetic(
  cosmeticId: unknown,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) =>
    player.equipCosmetic(parse(cosmeticIdSchema, cosmeticId)),
  );
}

export async function setUsername(
  username: unknown,
): Promise<ActionResult<PlayerSnapshot>> {
  return run(({ player }) =>
    player.setUsername(parse(usernameSchema, username)),
  );
}

export async function getLeaderboard(
  region: unknown,
): Promise<ActionResult<Leaderboard>> {
  return run(({ leaderboard }) =>
    leaderboard.get(parse(leaderboardRegionSchema, region)),
  );
}
