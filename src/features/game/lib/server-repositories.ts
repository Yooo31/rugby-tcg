import { createCatalogRepositories, type Repositories } from "@/data";
import {
  buyBoosters,
  buyCosmetic,
  claimAlbumReward,
  claimGiveaway,
  claimMission,
  claimStreak,
  equipCosmetic,
  getLeaderboard,
  getPlayer,
  openBooster,
  setUsername,
} from "../server/actions";
import { unwrap } from "./action-result";

/**
 * Dépôts du navigateur : le catalogue est local, l'état du joueur passe par
 * les actions serveur. Un refus revient sous forme d'erreur du domaine,
 * comme avec le mock.
 */
export function createServerRepositories(): Repositories {
  return {
    ...createCatalogRepositories(),
    player: {
      get: async () => unwrap(await getPlayer()),
      openBooster: async () => unwrap(await openBooster()),
      buyBoosters: async (offerId) => unwrap(await buyBoosters(offerId)),
      claimMission: async (missionId) => unwrap(await claimMission(missionId)),
      claimAlbumReward: async (albumId) =>
        unwrap(await claimAlbumReward(albumId)),
      claimGiveaway: async (giveawayId) =>
        unwrap(await claimGiveaway(giveawayId)),
      claimStreak: async () => unwrap(await claimStreak()),
      buyCosmetic: async (cosmeticId) => unwrap(await buyCosmetic(cosmeticId)),
      equipCosmetic: async (cosmeticId) =>
        unwrap(await equipCosmetic(cosmeticId)),
      setUsername: async (username) => unwrap(await setUsername(username)),
    },
    leaderboard: {
      get: async (region) => unwrap(await getLeaderboard(region)),
    },
  };
}
