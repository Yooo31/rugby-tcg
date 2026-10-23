import { z } from "zod";
import type { Rng } from "@/lib/rng";

/**
 * Parrainage : le filleul reçoit un booster à l'inscription ; le parrain en
 * reçoit deux quand le filleul a vraiment joué (ouvert des boosters trois
 * jours différents). Un faux compte rapporte donc peu, et le gain est plafonné.
 */

/** Boosters bonus offerts au filleul à son inscription. */
export const REFERRAL_WELCOME_BOOSTERS = 1;
/** Boosters bonus offerts au parrain pour un filleul actif. */
export const REFERRER_REWARD_BOOSTERS = 2;
/** Jours différents où le filleul doit avoir ouvert un booster. */
export const REFERRAL_ACTIVE_DAYS = 3;
/** Filleuls récompensés au plus par parrain. */
export const MAX_REWARDED_REFERRALS = 10;

/** Sans 0/O ni 1/I/L : un code se lit et se dicte sans erreur. */
const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const REFERRAL_CODE_LENGTH = 6;

export function generateReferralCode(rng: Rng): string {
  return Array.from(
    { length: REFERRAL_CODE_LENGTH },
    () => CODE_ALPHABET[Math.floor(rng() * CODE_ALPHABET.length)],
  ).join("");
}

/** Code saisi par le filleul : espaces retirés, majuscules. */
export const referralCodeSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(
    new RegExp(`^[${CODE_ALPHABET}]{${REFERRAL_CODE_LENGTH}}$`),
    "Ce code de parrainage n'est pas valide.",
  );

/** Le parrain doit-il être récompensé pour ce filleul ? */
export function referrerEarns(
  activeDays: number,
  alreadyRewarded: number,
): boolean {
  return (
    activeDays >= REFERRAL_ACTIVE_DAYS &&
    alreadyRewarded < MAX_REWARDED_REFERRALS
  );
}
