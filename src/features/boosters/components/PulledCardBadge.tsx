import type { PulledCard } from "@/domain";

/** Étiquette de nouveauté d'une carte tirée ; rien pour un simple doublon. */
export function PulledCardBadge({ card }: { readonly card: PulledCard }) {
  if (!card.isNewCard) return <span className="eyebrow">Doublon</span>;
  return (
    <span className="bg-gold text-night font-display rounded-full px-3 py-0.5 text-sm font-bold tracking-wider uppercase">
      {card.isNewClub ? "Nouveau club" : "Nouvelle rareté"}
    </span>
  );
}
