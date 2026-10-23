import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

interface ChipProps extends ComponentProps<"button"> {
  readonly selected: boolean;
}

/** Pastille de filtre à bascule. */
export function Chip({ selected, className, ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "min-h-11 shrink-0 rounded-full border px-4 text-sm font-medium transition duration-200",
        selected
          ? "border-pitch bg-pitch/15 text-pitch"
          : "border-line bg-surface text-chalk-muted hover:border-line-strong hover:text-chalk",
        className,
      )}
      {...props}
    />
  );
}
