import "server-only";
import { creditIngotPack, getIngotPack, type IngotPackId } from "@/domain";
import type { PrismaClient } from "@/generated/prisma/client";
import { createPrismaPlayerStore, isUniqueViolation } from "./prisma-store";

/**
 * Crédite un paquet de lingots payé. À n'appeler que depuis le serveur de
 * paiement (webhook signé), avec le joueur rattaché au paiement côté
 * serveur : jamais un identifiant venu du navigateur.
 *
 * Un paiement déjà crédité (même `reference`) ne crédite rien : la contrainte
 * d'unicité annule toute la transaction, lingots compris. Renvoie `true` si
 * les lingots viennent d'être crédités.
 */
export async function creditIngotPurchase(
  prisma: PrismaClient,
  playerId: string,
  purchase: { readonly packId: IngotPackId; readonly reference: string },
): Promise<boolean> {
  const pack = getIngotPack(purchase.packId);
  try {
    await createPrismaPlayerStore(prisma, playerId).update((record) => ({
      record: { ...record, wallet: creditIngotPack(record.wallet, pack.id) },
      result: undefined,
      events: [
        {
          type: "ingots-purchased",
          packId: pack.id,
          ingots: pack.ingots,
          priceCents: pack.priceCents,
          reference: purchase.reference,
        },
      ],
    }));
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}
