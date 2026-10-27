import "server-only";
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
