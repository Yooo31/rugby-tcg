import "server-only";
import { createServerPlayerRepository } from "@/data/server";
import type { PlayerSnapshot } from "@/domain";
import { getAuthUser } from "@/features/auth/server";
import { PlayerSeed } from "../GameProvider";

async function readSnapshot(): Promise<PlayerSnapshot | null> {
  const user = await getAuthUser();
  if (!user) return null;
  try {
    return await createServerPlayerRepository(user.id).get();
  } catch (error) {
    // Base injoignable : le navigateur réessaiera par l'action serveur.
    console.error("Lecture de l'état du joueur impossible", error);
    return null;
  }
}

/**
 * Lit l'état du joueur pendant le rendu de la page et le transmet au
 * `GameProvider`, dans la même réponse : pas d'aller-retour après chargement.
 * À placer sous une frontière `<Suspense>` (il lit la session).
 */
export async function InitialPlayer() {
  return <PlayerSeed snapshot={await readSnapshot()} />;
}
