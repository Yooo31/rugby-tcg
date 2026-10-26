"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SIGN_IN_PATH } from "@/lib/supabase/routes";
import { signOut } from "../server/actions";

/**
 * Déconnexion suivie d'un rechargement complet : Next.js garde sinon les
 * écrans quittés en mémoire, et le compte suivant verrait ceux du précédent.
 */
export function SignOutButton() {
  return (
    <form
      action={async () => {
        await signOut();
        window.location.replace(SIGN_IN_PATH);
      }}
    >
      <Button type="submit" variant="secondary" block>
        <LogOut aria-hidden className="size-5" />
        Se déconnecter
      </Button>
    </form>
  );
}
