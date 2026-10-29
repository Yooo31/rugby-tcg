import "server-only";
import { inactiveSince } from "@/domain";
import type { PrismaClient } from "@/generated/prisma/client";

/**
 * Supprime définitivement un compte : l'utilisateur Supabase, et par cascade
 * le joueur, ses cartes, journaux, abonnements et récompenses. Ses filleuls
 * perdent simplement leur parrain. Irréversible.
 */
export async function deleteAccount(
  prisma: PrismaClient,
  userId: string,
): Promise<void> {
  await prisma.$executeRaw`DELETE FROM auth.users WHERE id = ${userId}::uuid`;
}

/**
 * Supprime les comptes sans activité depuis `INACTIVE_ACCOUNT_YEARS` ans
 * (politique de confidentialité). L'activité est la plus récente de :
 * création du compte, dernière connexion, dernière écriture sur le joueur,
 * dernier booster ouvert. Un pass VIP encore payé protège le compte.
 * Renvoie le nombre de comptes supprimés.
 */
export async function deleteInactiveAccounts(
  prisma: PrismaClient,
  now: Date,
): Promise<number> {
  const limit = inactiveSince(now);
  return prisma.$executeRaw`
    DELETE FROM auth.users u
    WHERE greatest(
        u.created_at,
        coalesce(u.last_sign_in_at, u.created_at),
        coalesce((SELECT p.updated_at FROM players p WHERE p.id = u.id), u.created_at),
        coalesce(
          (SELECT max(b.opened_at) FROM booster_openings b WHERE b.player_id = u.id),
          u.created_at
        )
      ) < ${limit}
      AND NOT EXISTS (
        SELECT 1 FROM vip_memberships v
        WHERE v.player_id = u.id AND v.ends_at > ${now}
      )`;
}

/** Tout ce que le jeu garde sur un joueur, pour le lui remettre (portabilité). */
export async function exportAccount(prisma: PrismaClient, userId: string) {
  const [user] = await prisma.$queryRaw<
    { email: string | null; createdAt: Date }[]
  >`SELECT email::text AS email, created_at AS "createdAt" FROM auth.users WHERE id = ${userId}::uuid`;
  const player = await prisma.player.findUnique({
    where: { id: userId },
    include: {
      ownedCards: { omit: { playerId: true } },
      ownedSpecialCards: { omit: { playerId: true } },
      ownedCosmetics: { omit: { playerId: true } },
      ingotPurchases: { omit: { playerId: true } },
      vipMemberships: { omit: { playerId: true, grantedBy: true } },
      seasonLog: { omit: { playerId: true } },
      seasonPasses: { omit: { playerId: true, grantedBy: true } },
      missionLog: { omit: { playerId: true } },
      claimedAlbums: { omit: { playerId: true } },
      claimedGiveaways: { omit: { playerId: true } },
      boosterOpenings: {
        omit: { playerId: true },
        orderBy: { openedAt: "asc" },
      },
      adjustments: { omit: { playerId: true, adminEmail: true } },
      pushSubscriptions: { select: { createdAt: true } },
    },
  });
  return {
    exportedAt: new Date().toISOString(),
    account: { email: user?.email ?? null, createdAt: user?.createdAt ?? null },
    player,
  };
}
