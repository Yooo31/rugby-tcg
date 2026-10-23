import { ChevronRight, Trophy } from "lucide-react";
import Link from "next/link";

/** Accès au classement depuis l'accueil (la barre d'onglets est déjà pleine). */
export function LeaderboardTeaser() {
  return (
    <Link
      href="/classement"
      className="panel hover:border-line-strong flex min-h-16 items-center gap-4 p-5 transition duration-200 active:scale-[0.99]"
    >
      <Trophy aria-hidden className="text-gold size-7 shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="text-chalk-muted block text-xl font-bold tracking-wider">
          Classement
        </span>
        <span className="text-chalk-muted block text-sm">
          Comparez votre collection à celle des autres joueurs.
        </span>
      </span>
      <ChevronRight aria-hidden className="text-chalk-faint size-5 shrink-0" />
    </Link>
  );
}
