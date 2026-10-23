import type { AlbumProgress } from "@/domain";
import { cn } from "@/lib/utils";

const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Anneau de progression d'un album, avec le pourcentage au centre. */
export function ProgressRing({
  progress,
  className,
}: {
  readonly progress: AlbumProgress;
  readonly className?: string;
}) {
  const percent = Math.round(progress.ratio * 100);
  return (
    <div
      role="img"
      aria-label={`${percent} % terminé`}
      className={cn(
        "relative grid size-24 shrink-0 place-items-center",
        className,
      )}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          className="stroke-white/10"
        />
        <circle
          cx="50"
          cy="50"
          r={RADIUS}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress.ratio)}
          className={cn(
            "transition-[stroke-dashoffset] duration-700",
            progress.isComplete ? "stroke-gold" : "stroke-pitch",
          )}
        />
      </svg>
      <span className="font-display text-2xl font-bold tabular-nums">
        {percent}
        <span className="text-chalk-muted text-sm">%</span>
      </span>
    </div>
  );
}
