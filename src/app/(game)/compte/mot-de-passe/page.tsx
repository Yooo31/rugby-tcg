import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ScreenHeader } from "@/components/layout/ScreenHeader";
import { UpdatePasswordForm } from "@/features/auth";

export const metadata: Metadata = { title: "Mot de passe" };

export default function UpdatePasswordPage() {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-6">
      <Link
        href="/compte"
        className="text-chalk-muted hover:text-chalk -ml-1 flex min-h-11 items-center gap-1.5 self-start text-sm transition"
      >
        <ArrowLeft aria-hidden className="size-4" />
        Compte
      </Link>
      <ScreenHeader eyebrow="Sécurité" title="Mot de passe" />
      <section className="panel p-5">
        <UpdatePasswordForm />
      </section>
    </div>
  );
}
