import "server-only";
import {
  creditIngotPack,
  extendVip,
  getIngotPack,
  getVipOffer,
  SEASON_PASS_PRICE_CENTS,
  WELCOME_OFFER,
  type IngotPackId,
  type PurchaseProduct,
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
  purchase: {
    readonly packId: IngotPackId;
    readonly reference: string;
    /** Prix payé ; par défaut le prix normal (hors promotion). */
    readonly priceCents?: number;
  },
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
          priceCents: purchase.priceCents ?? pack.priceCents,
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
  purchase: {
    readonly offerId: VipOffer["id"];
    readonly reference: string;
    readonly priceCents?: number;
  },
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
              priceCents: purchase.priceCents ?? offer.priceCents,
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

/**
 * Crédite la voie payante d'une saison payée : une nouvelle ligne par achat,
 * l'index unique partiel refuse une seconde voie payante active. Renvoie
 * `false` si ce paiement est déjà crédité, ou si le joueur avait déjà la voie
 * payante (à rembourser à la main).
 */
async function creditSeasonPassPurchase(
  prisma: PrismaClient,
  playerId: string,
  purchase: {
    readonly seasonId: string;
    readonly reference: string;
    readonly priceCents?: number;
  },
): Promise<boolean> {
  try {
    await prisma.seasonPass.create({
      data: {
        playerId,
        seasonId: purchase.seasonId,
        reference: purchase.reference,
        priceCents: purchase.priceCents ?? SEASON_PASS_PRICE_CENTS,
      },
    });
    return true;
  } catch (error) {
    if (!isUniqueViolation(error)) throw error;
  }
  // Même paiement rejoué (même s'il a été remboursé depuis) : rien à faire.
  const replayed = await prisma.seasonPass.findUnique({
    where: { reference: purchase.reference },
  });
  if (replayed) return false;
  // Voie payante déjà active (offerte, ou payée deux fois en parallèle) :
  // paiement à rembourser à la main.
  console.error(
    `Voie payante déjà possédée, paiement à rembourser : ${purchase.reference}`,
  );
  return false;
}

/** L'offre de bienvenue a déjà été prise : une seule fois par compte. */
class WelcomeOfferTakenError extends Error {}

/**
 * Crédite l'offre de bienvenue : ses lingots et ses jours de VIP, dans la
 * même transaction. Une seule fois par compte (vérifié sous verrou, et par un
 * index unique en base) ; un second paiement est signalé pour remboursement.
 */
async function creditWelcomePurchase(
  prisma: PrismaClient,
  playerId: string,
  purchase: { readonly reference: string; readonly priceCents?: number },
  now: Date,
): Promise<boolean> {
  try {
    await createPrismaPlayerStore(prisma, playerId).update((record) => {
      if (record.welcomeOfferTaken) throw new WelcomeOfferTakenError();
      const membership = extendVip(
        record.vipMemberships,
        now.getTime(),
        WELCOME_OFFER.vipDays,
      );
      return {
        record: {
          ...record,
          wallet: {
            ...record.wallet,
            ingots: record.wallet.ingots + WELCOME_OFFER.ingots,
          },
          vipMemberships: [...record.vipMemberships, membership],
          welcomeOfferTaken: true,
        },
        result: undefined,
        events: [
          {
            type: "ingots-purchased",
            packId: WELCOME_OFFER.id,
            ingots: WELCOME_OFFER.ingots,
            priceCents: purchase.priceCents ?? WELCOME_OFFER.priceCents,
            reference: purchase.reference,
          },
          // Les jours de VIP sont compris dans le prix : ils ne comptent pas
          // une seconde fois dans le revenu.
          {
            type: "vip-granted",
            membership,
            purchase: {
              offerId: WELCOME_OFFER.id,
              priceCents: 0,
              reference: purchase.reference,
            },
          },
        ],
      };
    });
    return true;
  } catch (error) {
    if (isUniqueViolation(error)) return false;
    if (error instanceof WelcomeOfferTakenError) {
      console.error(
        `Offre de bienvenue déjà prise, paiement à rembourser : ${purchase.reference}`,
      );
      return false;
    }
    throw error;
  }
}

/** Ce qu'un remboursement a retiré, pour le journal. */
export type RevokedPurchase = "ingots" | "vip" | "season-pass";

/**
 * Retire un achat remboursé ou contesté (`reference` = celle du crédit). Les
 * lingots sont repris sans passer sous zéro (ceux déjà dépensés restent
 * dépensés) ; une période VIP ou une voie payante cesse de compter. Un achat
 * déjà retiré ne retire rien : renvoie `null`.
 */
export async function revokePurchase(
  prisma: PrismaClient,
  reference: string,
): Promise<RevokedPurchase | null> {
  return prisma.$transaction(async (tx) => {
    const [ingots] = await tx.$queryRaw<
      { playerId: string; ingots: number }[]
    >`UPDATE ingot_purchases SET refunded_at = now()
      WHERE reference = ${reference} AND refunded_at IS NULL
      RETURNING player_id AS "playerId", ingots`;
    if (ingots) {
      await tx.$executeRaw`UPDATE players
        SET ingots = greatest(0, ingots - ${ingots.ingots}), updated_at = now()
        WHERE id = ${ingots.playerId}::uuid`;
      // L'offre de bienvenue a aussi des jours de VIP, au même paiement.
      await tx.$executeRaw`UPDATE vip_memberships SET refunded_at = now()
        WHERE reference = ${reference} AND refunded_at IS NULL`;
      return "ingots";
    }
    const vip =
      await tx.$executeRaw`UPDATE vip_memberships SET refunded_at = now()
      WHERE reference = ${reference} AND refunded_at IS NULL`;
    if (vip > 0) return "vip";
    const pass =
      await tx.$executeRaw`UPDATE season_passes SET refunded_at = now()
      WHERE reference = ${reference} AND refunded_at IS NULL`;
    return pass > 0 ? "season-pass" : null;
  });
}

/** Crédite un produit payé, quel qu'il soit ; `false` s'il l'était déjà. */
export function creditPurchase(
  prisma: PrismaClient,
  playerId: string,
  product: PurchaseProduct,
  reference: string,
  now: Date,
  priceCents?: number,
): Promise<boolean> {
  switch (product.kind) {
    case "ingots":
      return creditIngotPurchase(prisma, playerId, {
        packId: product.id,
        reference,
        priceCents,
      });
    case "vip":
      return creditVipPurchase(
        prisma,
        playerId,
        { offerId: product.id, reference, priceCents },
        now,
      );
    case "season-pass":
      return creditSeasonPassPurchase(prisma, playerId, {
        seasonId: product.id,
        reference,
        priceCents,
      });
    case "welcome":
      return creditWelcomePurchase(
        prisma,
        playerId,
        { reference, priceCents },
        now,
      );
  }
}
