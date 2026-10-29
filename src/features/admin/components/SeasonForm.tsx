"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { INITIAL_ADMIN_FORM_STATE } from "../lib/schemas";
import { createSeasonAction } from "../server/actions";
import { FormMessage } from "./FormMessage";

/** Programmer une saison du passe de saison, sur des jours entiers (heure de Paris). */
export function SeasonForm({
  today,
  inEightWeeks,
}: {
  readonly today: string;
  readonly inEightWeeks: string;
}) {
  const [state, action, isPending] = useActionState(
    createSeasonAction,
    INITIAL_ADMIN_FORM_STATE,
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        label="Titre"
        name="title"
        required
        maxLength={80}
        placeholder="Saison d'automne"
        error={state.fieldErrors?.title}
      />
      <div className="grid grid-cols-2 gap-3">
        <TextField
          label="Premier jour"
          name="startDay"
          type="date"
          required
          defaultValue={today}
          error={state.fieldErrors?.startDay}
        />
        <TextField
          label="Dernier jour"
          name="endDay"
          type="date"
          required
          defaultValue={inEightWeeks}
          error={state.fieldErrors?.endDay}
        />
      </div>
      <p className="text-chalk-muted text-sm text-pretty">
        Jours entiers, heure de Paris. Une seule saison à la fois : les dates ne
        peuvent pas chevaucher une autre saison. Huit semaines conseillées.
      </p>
      <FormMessage state={state} />
      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        Programmer la saison
      </Button>
    </form>
  );
}
