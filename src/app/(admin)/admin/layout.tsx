import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AdminGuard } from "@/features/admin/server";

/** L'administration ne doit jamais apparaître dans un moteur de recherche. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const ADMIN_LINKS = [
  { href: "/admin", label: "Tableau de bord" },
  { href: "/admin/joueurs", label: "Joueurs" },
  { href: "/admin/cadeaux", label: "Cadeaux" },
] as const;

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 px-4 py-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <p className="eyebrow text-pitch">Administration</p>
          <Link
            href="/"
            className="text-chalk-muted text-sm underline-offset-4 hover:underline"
          >
            Retour au jeu
          </Link>
        </div>
        <nav aria-label="Administration">
          <ul className="flex flex-wrap gap-2">
            {ADMIN_LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="border-line bg-surface hover:border-line-strong flex min-h-11 items-center rounded-full border px-4 text-sm font-medium"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      {/* Droits et données dépendent de la requête : rendus sous Suspense. */}
      <Suspense fallback={<div className="skeleton h-64" />}>
        <AdminGuard>{children}</AdminGuard>
      </Suspense>
    </div>
  );
}
