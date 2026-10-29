import "server-only";
import {
  creditIngotPack,
  extendVip,
  getIngotPack,
  getVipOffer,
  type IngotPackId,
  type VipOffer,
} from "@/domain";
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

/**
 * Crédite un pass VIP payé : une période de la durée de l'offre, à la suite
 * de l'adhésion en cours. Mêmes garanties que `creditIngotPurchase` (serveur
 * de paiement seulement, un paiement crédité une fois). Renvoie `true` si la
 * période vient d'être ajoutée.
 */
export async function creditVipPurchase(
  prisma: PrismaClient,
  playerId: string,
  purchase: { readonly offerId: VipOffer["id"]; readonly reference: string },
  now: Date,
): Promise<boolean> {
  const offer = getVipOffer(purchase.offerId);
  try {
    await createPrismaPlayerStore(prisma, playerId).update((record) => {
      const membership = extendVip(
        record.vipMemberships,
        now.getTime(),
        offer.days,
      );
      return {
        record: {
          ...record,
          vipMemberships: [...record.vipMemberships, membership],
        },
        result: undefined,
        events: [
          {
            type: "vip-granted",
            membership,
            purchase: {
              offerId: offer.id,
              priceCents: offer.priceCents,
              reference: purchase.reference,
            },
          },
        ],
      };
    });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    throw error;
  }
}
