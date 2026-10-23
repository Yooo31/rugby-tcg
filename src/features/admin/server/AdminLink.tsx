import "server-only";
import { ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { isCurrentUserAdmin } from "./guard";

/** Lien vers l'administration, montré aux seuls administrateurs (l'accès est revérifié là-bas). */
export async function AdminLink() {
  if (!(await isCurrentUserAdmin())) return null;
  return (
    <Link
      href="/admin"
      className="border-line hover:border-line-strong rounded-control flex min-h-12 items-center justify-between border px-4 text-sm font-medium transition"
    >
      <span className="flex items-center gap-2">
        <ShieldCheck aria-hidden className="text-pitch size-5" />
        Administration
      </span>
      <ChevronRight aria-hidden className="text-chalk-faint size-5" />
    </Link>
  );
}
