import "server-only";
import {
  generateReferralCode,
  REFERRAL_WELCOME_BOOSTERS,
  REFERRER_REWARD_BOOSTERS,
  referrerEarns,
} from "@/domain";
import type { PrismaClient } from "@/generated/prisma/client";
import { secureRng } from "@/lib/rng";
import { isUniqueViolation } from "./prisma-store";

/** Essais de génération avant d'abandonner (une collision est déjà très rare). */
const CODE_ATTEMPTS = 5;

/** Code de parrainage du joueur, créé à la première demande. */
export async function getOrCreateReferralCode(
  prisma: PrismaClient,
  playerId: string,
): Promise<string> {
  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const player = await prisma.player.findUniqueOrThrow({
      where: { id: playerId },
      select: { referralCode: true },
    });
    if (player.referralCode) return player.referralCode;
    try {
      await prisma.player.updateMany({
        where: { id: playerId, referralCode: null },
        data: { referralCode: generateReferralCode(secureRng) },
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error("Impossible de créer un code de parrainage.");
}

export async function referralCodeExists(
  prisma: PrismaClient,
  code: string,
): Promise<boolean> {
  return (await prisma.player.count({ where: { referralCode: code } })) > 0;
}

/**
 * Rattache un nouveau joueur à son parrain et lui offre son booster de
 * bienvenue. Sans effet si le code est inconnu, si c'est le sien ou s'il a
 * déjà un parrain.
 */
export async function applyReferral(
  prisma: PrismaClient,
  playerId: string,
  code: string,
): Promise<void> {
  const referrer = await prisma.player.findUnique({
    where: { referralCode: code },
    select: { id: true },
  });
  if (!referrer || referrer.id === playerId) return;
  await prisma.player.updateMany({
    where: { id: playerId, referredBy: null },
    data: {
      referredBy: referrer.id,
      bonusBoosters: { increment: REFERRAL_WELCOME_BOOSTERS },
    },
  });
}

/**
 * Récompense le parrain si le filleul vient d'atteindre ses jours actifs.
 * Appelée après chaque ouverture de booster ; ne paie qu'une fois par filleul,
 * même si deux ouvertures arrivent en même temps (verrou sur le parrain).
 */
export async function settleReferral(
  prisma: PrismaClient,
  playerId: string,
): Promise<void> {
  const player = await prisma.player.findUnique({
    where: { id: playerId },
    select: { referredBy: true, referralRewardedAt: true },
  });
  if (!player?.referredBy || player.referralRewardedAt) return;
  const referrerId = player.referredBy;

  const [{ days }] = await prisma.$queryRaw<{ days: number }[]>`
    SELECT count(DISTINCT (opened_at AT TIME ZONE 'Europe/Paris')::date)::int AS days
    FROM booster_openings WHERE player_id = ${playerId}::uuid`;
  if (!referrerEarns(days, 0)) return;

  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM players WHERE id = ${referrerId}::uuid FOR UPDATE`;
    const marked = await tx.player.updateMany({
      where: { id: playerId, referralRewardedAt: null },
      data: { referralRewardedAt: new Date() },
    });
    if (marked.count === 0) return;
    const rewarded = await tx.player.count({
      where: {
        referredBy: referrerId,
        referralRewardedAt: { not: null },
        id: { not: playerId },
      },
    });
    // Au-delà du plafond, le filleul compte comme traité, sans récompense.
    if (!referrerEarns(days, rewarded)) return;
    await tx.player.update({
      where: { id: referrerId },
      data: { bonusBoosters: { increment: REFERRER_REWARD_BOOSTERS } },
    });
  });
}

export interface ReferralSummary {
  readonly code: string;
  /** Filleuls inscrits avec ce code. */
  readonly referred: number;
  /** Filleuls devenus actifs (parrain récompensé ou plafond atteint). */
  readonly active: number;
}

export async function referralSummary(
  prisma: PrismaClient,
  playerId: string,
): Promise<ReferralSummary> {
  const code = await getOrCreateReferralCode(prisma, playerId);
  const [referred, active] = await Promise.all([
    prisma.player.count({ where: { referredBy: playerId } }),
    prisma.player.count({
      where: { referredBy: playerId, referralRewardedAt: { not: null } },
    }),
  ]);
  return { code, referred, active };
}
