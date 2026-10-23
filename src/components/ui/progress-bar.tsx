import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Entre 0 et 1. */
  readonly ratio: number;
  readonly label: string;
  readonly complete?: boolean;
  readonly className?: string;
}

export function ProgressBar({
  ratio,
  label,
  complete = false,
  className,
}: ProgressBarProps) {
  const percent = Math.round(Math.min(1, Math.max(0, ratio)) * 100);
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-1.5 overflow-hidden rounded-full bg-white/8", className)}
    >
      <div
        className={cn(
          "ease-out-expo h-full rounded-full transition-[width] duration-700",
          complete ? "bg-gold" : "bg-pitch",
        )}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
