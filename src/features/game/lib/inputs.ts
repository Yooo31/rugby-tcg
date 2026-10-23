import { z } from "zod";
import { BOOSTER_OFFERS, regionIdSchema } from "@/domain";

/** Paramètres reçus du navigateur par les actions du jeu : validés avant usage. */

export const offerIdSchema = z.enum(BOOSTER_OFFERS.map(({ id }) => id));

/** Identifiant de mission ou d'album : court, en minuscules et tirets. */
export const rewardIdSchema = z
  .string()
  .max(100)
  .regex(/^[a-z0-9-]+$/);

/** Identifiant de cadeau : un UUID (généré par la base). */
export const giveawayIdSchema = z.uuid();

/** Filtre du classement : une région, ou `null` pour la France entière. */
export const leaderboardRegionSchema = regionIdSchema.nullable();

/**
 * Actions du joueur par fenêtre de 10 secondes. Un joueur pressé qui ouvre
 * ses boosters et récupère ses missions reste loin en dessous.
 */
export const ACTIONS_PER_WINDOW = 30;
export const ACTION_WINDOW_MS = 10_000;
