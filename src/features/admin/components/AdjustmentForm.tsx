"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { INITIAL_ADMIN_FORM_STATE } from "../lib/schemas";
import { adjustPlayerAction } from "../server/actions";
import { FormMessage } from "./FormMessage";

/** Ajouter ou retirer des lingots et des boosters bonus à un joueur, avec une raison. */
export function AdjustmentForm({ playerId }: { readonly playerId: string }) {
  const [state, action, isPending] = useActionState(
    adjustPlayerAction,
    INITIAL_ADMIN_FORM_STATE,
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="playerId" value={playerId} />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Lingots (±)"
          name="ingotsDelta"
          inputMode="numeric"
          placeholder="0"
          error={state.fieldErrors?.ingotsDelta}
        />
        <TextField
          label="Boosters bonus (±)"
          name="boostersDelta"
          inputMode="numeric"
          placeholder="0"
          error={state.fieldErrors?.boostersDelta}
        />
      </div>
      <TextField
        label="Raison"
        name="reason"
        required
        maxLength={200}
        hint="Gardée dans l'historique du joueur."
        error={state.fieldErrors?.reason ?? state.fieldErrors?.form}
      />
      <FormMessage state={state} />
      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        Appliquer la correction
      </Button>
    </form>
  );
}
