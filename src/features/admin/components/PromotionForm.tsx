"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import { MAX_PROMOTION_PERCENT, PROMOTION_GAP_DAYS } from "@/domain";
import { INITIAL_ADMIN_FORM_STATE } from "../lib/schemas";
import { createPromotionAction } from "../server/actions";
import { FormMessage } from "./FormMessage";

/** Programmer une promotion réelle, sur des jours entiers (heure de Paris). */
export function PromotionForm({ today }: { readonly today: string }) {
  const [state, action, isPending] = useActionState(
    createPromotionAction,
    INITIAL_ADMIN_FORM_STATE,
  );
  return (
    <form action={action} className="flex flex-col gap-4">
      <TextField
        label="Titre"
        name="title"
        required
        maxLength={80}
        placeholder="Week-end du Top 14"
        error={state.fieldErrors?.title}
      />
      <TextField
        label="Réduction (%)"
        name="percentOff"
        type="number"
        inputMode="numeric"
        required
        min={1}
        max={MAX_PROMOTION_PERCENT}
        error={state.fieldErrors?.percentOff}
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
          defaultValue={today}
          error={state.fieldErrors?.endDay}
        />
      </div>
      <p className="text-chalk-muted text-sm text-pretty">
        Sur tous les achats en euros (lingots, pass VIP, voie payante). Le prix
        normal est barré : la loi impose qu&apos;il soit le plus bas des 30
        jours précédents, donc {PROMOTION_GAP_DAYS} jours sans promotion avant
        et après chacune.
      </p>
      <FormMessage state={state} />
      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        Programmer la promotion
      </Button>
    </form>
  );
}
