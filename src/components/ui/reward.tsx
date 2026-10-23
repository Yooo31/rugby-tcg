import type { Reward } from "@/domain";
import { cn } from "@/lib/utils";

/** Pictogramme du lingot, la monnaie du jeu. */
export function IngotIcon({ className }: { readonly className?: string }) {
  return (
    <svg
      viewBox="0 0 24 16"
      aria-hidden
      className={cn("text-gold h-3.5 w-5 shrink-0", className)}
    >
      <path d="M6 1h12l5 14H1z" fill="currentColor" />
      <path d="M6 1h12l1.6 4.5H4.4z" fill="#fff" fillOpacity="0.35" />
    </svg>
  );
}

interface IngotAmountProps {
  readonly amount: number;
  readonly className?: string;
}

/** Un montant en lingots, lisible aussi par un lecteur d'écran. */
export function IngotAmount({ amount, className }: IngotAmountProps) {
  return (
    <span
      className={cn(
        "font-display inline-flex items-center gap-1.5 font-bold tabular-nums",
        className,
      )}
    >
      <IngotIcon />
      {amount}
      <span className="sr-only"> lingot{amount > 1 ? "s" : ""}</span>
    </span>
  );
}

/** Contenu d'une récompense : lingots, et boosters s'il y en a. */
export function RewardLabel({
  reward,
  className,
}: {
  readonly reward: Reward;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "text-gold inline-flex items-center gap-2 text-lg",
        className,
      )}
    >
      {/* Un cadeau fait uniquement de boosters n'affiche pas « 0 lingot ». */}
      {reward.ingots > 0 || reward.boosters === 0 ? (
        <IngotAmount amount={reward.ingots} />
      ) : null}
      {reward.boosters > 0 ? (
        <span className="font-display font-bold">
          {reward.ingots > 0 ? "+ " : ""}
          {reward.boosters} booster{reward.boosters > 1 ? "s" : ""}
        </span>
      ) : null}
    </span>
  );
}
