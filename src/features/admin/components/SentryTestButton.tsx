"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { INITIAL_ADMIN_FORM_STATE } from "../lib/schemas";
import { sendTestErrorAction } from "../server/actions";
import { FormMessage } from "./FormMessage";

/** Vérifie que les erreurs arrivent bien dans Sentry. */
export function SentryTestButton() {
  const [state, action, isPending] = useActionState(
    sendTestErrorAction,
    INITIAL_ADMIN_FORM_STATE,
  );
  return (
    <form action={action} className="flex flex-col gap-3">
      <Button type="submit" variant="secondary" disabled={isPending}>
        Envoyer une erreur de test
      </Button>
      <FormMessage state={state} />
    </form>
  );
}
