import type { BoosterStock } from "@/domain";
import { cn } from "@/lib/utils";

interface BoosterPipsProps {
  readonly stock: BoosterStock;
  readonly className?: string;
}

const plural = (count: number) => (count > 1 ? "s" : "");

/** Jauge de la réserve : une pastille par booster gratuit, puis le nombre de bonus. */
export function BoosterPips({
  stock: { free, max, bonus },
  className,
}: BoosterPipsProps) {
  const label =
    `${free} booster${plural(free)} gratuit${plural(free)} sur ${max}` +
    (bonus > 0 ? `, ${bonus} booster${plural(bonus)} bonus` : "");

  return (
    <div
      role="img"
      aria-label={label}
      className={cn("flex items-center gap-1.5", className)}
    >
      {Array.from({ length: max }, (_, index) => (
        <span
          key={index}
          className={cn(
            "h-2 w-4 -skew-x-12 rounded-[3px] transition-colors duration-500 sm:w-7",
            index < free
              ? "bg-pitch shadow-[0_0_12px_var(--color-pitch)]"
              : "bg-white/12",
          )}
        />
      ))}
      {bonus > 0 ? (
        <span className="text-gold font-display ml-1 text-lg leading-none font-bold">
          +{bonus}
        </span>
      ) : null}
    </div>
  );
}
