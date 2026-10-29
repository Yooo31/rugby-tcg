import { ChevronRight, Download } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { CATALOG_SEASON } from "@/data";
import { AdminLink } from "@/features/admin/server";
import { DeleteAccountForm, SignOutButton } from "@/features/auth";
import { requireAuthUser } from "@/features/auth/server";
import { UsernameSettings } from "@/features/game";
import { LegalLinks } from "@/features/legal";
import { NotificationsToggle } from "@/features/notifications";
import { CosmeticSettings } from "@/features/shop";
import { ReferralPanel } from "@/features/referral/server";
import { VipSettings } from "@/features/vip";
import { UPDATE_PASSWORD_PATH } from "@/lib/supabase/routes";

export const metadata: Metadata = { title: "Compte" };

/** Adresse du joueur : lue dans la session, donc rendue à la requête. */
async function AccountEmail() {
  const user = await requireAuthUser();
  return (
    <p className="mt-1 truncate text-lg font-medium">
      {user.email ?? "Adresse inconnue"}
    </p>
  );
}

export default function AccountPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <ScreenHeader eyebrow="Votre licence" title="Compte" />

      <section className="panel flex flex-col gap-5 p-5">
        <div className="flex flex-col gap-1">
          <p className="eyebrow">Pseudo</p>
          <UsernameSettings />
        </div>
        <div>
          <p className="eyebrow">Adresse e-mail</p>
          <Suspense fallback={<div className="skeleton mt-1 h-7 w-2/3" />}>
            <AccountEmail />
          </Suspense>
        </div>
        <Link
          href={UPDATE_PASSWORD_PATH}
          className="border-line hover:border-line-strong rounded-control flex min-h-12 items-center justify-between border px-4 text-sm font-medium transition"
        >
          Changer de mot de passe
          <ChevronRight aria-hidden className="text-chalk-faint size-5" />
        </Link>
        <Suspense fallback={null}>
          <AdminLink />
        </Suspense>
        <SignOutButton />
      </section>

      <section className="panel flex flex-col gap-3 p-5">
        <p className="eyebrow">Pass VIP</p>
        <VipSettings />
      </section>

      <section className="panel flex flex-col gap-3 p-5">
        <p className="eyebrow">Cosmétiques équipés</p>
        <CosmeticSettings />
      </section>

      <section className="panel flex flex-col gap-3 p-5">
        <p className="eyebrow">Notifications</p>
        <NotificationsToggle />
      </section>

      <section className="panel flex flex-col gap-3 p-5">
        <p className="eyebrow">Parrainage</p>
        <Suspense fallback={<div className="skeleton h-40" />}>
          <ReferralPanel />
        </Suspense>
      </section>

      <section className="panel flex flex-col gap-4 p-5">
        <p className="eyebrow">Vos données</p>
        <a
          href="/compte/donnees"
          download
          className="border-line hover:border-line-strong rounded-control flex min-h-12 items-center justify-between border px-4 text-sm font-medium transition"
        >
          Télécharger mes données
          <Download aria-hidden className="text-chalk-faint size-5" />
        </a>
        <LegalLinks className="text-chalk-muted text-sm" />
        <DeleteAccountForm />
      </section>

      <p className="text-chalk-muted text-center text-xs text-pretty">
        Données des clubs, saison {CATALOG_SEASON} :{" "}
        <a
          href="https://fr.wikipedia.org/wiki/Championnat_de_France_de_rugby_%C3%A0_XV"
          className="underline underline-offset-2"
          rel="noreferrer"
          target="_blank"
        >
          Wikipédia
        </a>{" "}
        (CC BY-SA 4.0) et Wikidata. Blasons générés, sans lien avec les logos
        officiels.
      </p>
    </div>
  );
}
