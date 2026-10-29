"use client";

import { createContext, use, type ReactNode } from "react";
import { DEFAULT_EQUIPPED, type EquippedCosmetics } from "@/domain";

/**
 * Cosmétiques équipés par le joueur, pour toutes les cartes affichées sous ce
 * fournisseur (dos à la révélation, cadre). Sans fournisseur : ceux de départ.
 */
const CardCosmeticsContext = createContext<EquippedCosmetics>(DEFAULT_EQUIPPED);

export function CardCosmeticsProvider({
  equipped,
  children,
}: {
  readonly equipped: EquippedCosmetics;
  readonly children: ReactNode;
}) {
  return (
    <CardCosmeticsContext value={equipped}>{children}</CardCosmeticsContext>
  );
}

export function useEquippedCosmetics(): EquippedCosmetics {
  return use(CardCosmeticsContext);
}
