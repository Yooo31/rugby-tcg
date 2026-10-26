"use client";

import { MailCheck } from "lucide-react";
import { useActionState, useEffect, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { INITIAL_AUTH_FORM_STATE, type AuthFormState } from "../lib/form-state";

interface AuthFormProps {
  readonly action: (
    state: AuthFormState,
    formData: FormData,
  ) => Promise<AuthFormState>;
  readonly submitLabel: string;
  /** Champs du formulaire, construits à partir de l'état renvoyé par l'action. */
  readonly children: (state: AuthFormState) => ReactNode;
}

/**
 * Formulaire d'authentification branché sur une action serveur : état
 * d'attente, erreur générale, et confirmation qui remplace le formulaire.
 */
export function AuthForm({ action, submitLabel, children }: AuthFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    INITIAL_AUTH_FORM_STATE,
  );

  useEffect(() => {
    if (state.redirectTo) window.location.replace(state.redirectTo);
  }, [state.redirectTo]);

  if (state.notice) {
    return (
      <div
        role="status"
        className="flex flex-col items-center gap-3 py-2 text-center"
      >
        <MailCheck aria-hidden className="text-pitch size-10" />
        <p className="text-sm text-pretty">{state.notice}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4" noValidate>
      {children(state)}
      {state.error ? (
        <p role="alert" className="text-danger text-sm">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        size="lg"
        block
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? "Un instant…" : submitLabel}
      </Button>
    </form>
  );
}
