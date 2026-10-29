import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

/** Pastille « VIP » : membre du pass, ou mission qui lui est réservée. */
export function VipBadge({ className }: { readonly className?: string }) {
  return (
    <span
      className={cn(
        "border-gold/50 bg-gold/10 text-gold inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-bold tracking-wider",
        className,
      )}
    >
      <Crown aria-hidden className="size-3" />
      VIP
    </span>
  );
}
