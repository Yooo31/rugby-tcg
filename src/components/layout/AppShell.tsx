"use client";

import {
  BookOpen,
  Home,
  Layers,
  PackageOpen,
  Target,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/boosters", label: "Boosters", icon: PackageOpen },
  { href: "/collection", label: "Collection", icon: Layers },
  { href: "/albums", label: "Albums", icon: BookOpen },
  { href: "/missions", label: "Missions", icon: Target },
] as const satisfies readonly {
  href: string;
  label: string;
  icon: LucideIcon;
}[];

type NavHref = (typeof NAV_ITEMS)[number]["href"];

function isActive(pathname: string, href: string): boolean {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

interface AppShellProps {
  readonly children: ReactNode;
  /** Nombre d'éléments en attente par onglet ; affiche une pastille s'il est positif. */
  readonly badges?: Partial<Record<NavHref, number>>;
  /** Contenu libre à droite de l'en-tête (solde du joueur…). */
  readonly headerEnd?: ReactNode;
}

/** Pastille dorée signalant une récompense à récupérer dans l'onglet. */
function NavBadge({ count }: { readonly count: number }) {
  if (count <= 0) return null;
  return (
    <span className="bg-gold text-night font-display grid h-4 min-w-4 place-items-center rounded-full px-1 text-xs leading-none font-bold">
      {count}
      <span className="sr-only"> à récupérer</span>
    </span>
  );
}

/** Coquille du jeu : marque en haut, onglets en bas sur mobile et en haut sur grand écran. */
export function AppShell({ children, badges = {}, headerEnd }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex h-14 items-center gap-4 md:h-16">
        <Link
          href="/"
          className="font-display mr-auto flex items-center gap-2 text-2xl font-extrabold tracking-wide uppercase"
        >
          <span
            aria-hidden
            className="bg-pitch h-5 w-3 -skew-x-12 rounded-[3px]"
          />
          Rugby <span className="text-pitch">TCG</span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex gap-1">
            {NAV_ITEMS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(pathname, href) ? "page" : undefined}
                  className="text-chalk-muted hover:text-chalk aria-[current=page]:bg-surface-raised aria-[current=page]:text-chalk flex min-h-11 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition"
                >
                  {label}
                  <NavBadge count={badges[href] ?? 0} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        {headerEnd}
      </header>

      <main className="pb-safe-nav flex-1 pt-2 md:pt-4 md:pb-16">
        {children}
      </main>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden"
      >
        {/* Fondu vers la nuit : le contenu qui défile s'efface avant de passer sous les onglets. */}
        <div
          aria-hidden
          className="from-night via-night/85 pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-t to-transparent"
        />
        <ul className="border-line-strong bg-surface/95 mx-auto flex max-w-md justify-between rounded-3xl border p-1.5 shadow-2xl shadow-black backdrop-blur-xl">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = isActive(pathname, href);
            return (
              <li key={href} className="flex-1">
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl text-[0.6875rem] font-medium transition duration-200",
                    active ? "bg-pitch/15 text-pitch" : "text-chalk-muted",
                  )}
                >
                  <Icon
                    aria-hidden
                    className="size-5"
                    strokeWidth={active ? 2.4 : 1.8}
                  />
                  {label}
                  <span className="absolute top-1.5 left-1/2 ml-1.5">
                    <NavBadge count={badges[href] ?? 0} />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
