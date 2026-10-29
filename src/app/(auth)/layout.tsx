import Link from "next/link";
import { Suspense } from "react";
import { LegalLinks } from "@/features/legal";

/** Pages d'authentification : la marque, puis un panneau centré. */
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-8 px-4 py-10">
      <Link
        href="/"
        className="font-display flex items-center justify-center gap-2 text-3xl font-extrabold tracking-wide uppercase"
      >
        <span
          aria-hidden
          className="bg-pitch h-6 w-3.5 -skew-x-12 rounded-[3px]"
        />
        Rugby <span className="text-pitch">TCG</span>
      </Link>
      <main className="panel p-6">
        {/* Les écrans lisent l'URL (paramètres de retour) : ils se rendent à la requête. */}
        <Suspense fallback={<div className="skeleton h-72" />}>
          {children}
        </Suspense>
      </main>
      <LegalLinks className="text-chalk-muted flex justify-center text-xs" />
    </div>
  );
}
