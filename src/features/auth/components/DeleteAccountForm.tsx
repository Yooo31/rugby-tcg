"use client";

import { TextField } from "@/components/ui/text-field";
import { DELETE_CONFIRMATION } from "../lib/schemas";
import { deleteAccount } from "../server/actions";
import { AuthForm } from "./AuthForm";

/** Suppression définitive du compte, repliée par défaut pour éviter un geste malheureux. */
export function DeleteAccountForm() {
  return (
    <details className="group">
      <summary className="text-danger cursor-pointer text-sm font-medium">
        Supprimer mon compte
      </summary>
      <div className="mt-4 flex flex-col gap-4">
        <p className="text-chalk-muted text-sm text-pretty">
          Votre compte, votre collection, vos lingots et tout votre historique
          seront effacés définitivement. Rien ne pourra être récupéré.
        </p>
        <AuthForm action={deleteAccount} submitLabel="Supprimer définitivement">
          {(state) => (
            <>
              <TextField
                label="Mot de passe"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                error={state.fieldErrors?.password}
              />
              <TextField
                label={`Recopiez ${DELETE_CONFIRMATION}`}
                name="confirmation"
                autoComplete="off"
                required
                error={state.fieldErrors?.confirmation}
              />
            </>
          )}
        </AuthForm>
      </div>
    </details>
  );
}
