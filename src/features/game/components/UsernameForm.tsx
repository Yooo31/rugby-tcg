"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/text-field";
import {
  USERNAME_MAX_LENGTH,
  USERNAME_MIN_LENGTH,
  usernameSchema,
} from "@/domain";
import type { ReadyGame } from "../GameProvider";
import { gameErrorMessage } from "../lib/messages";

interface UsernameFormProps {
  readonly game: ReadyGame;
  readonly submitLabel: string;
  /** Appelé une fois le pseudo enregistré. */
  readonly onSaved?: () => void;
}

/** Choix ou changement du pseudo, vérifié ici puis par le serveur (unicité). */
export function UsernameForm({
  game,
  submitLabel,
  onSaved,
}: UsernameFormProps) {
  const [value, setValue] = useState(game.username ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = usernameSchema.safeParse(value);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Pseudo invalide.");
      return;
    }
    setIsPending(true);
    setError(null);
    try {
      await game.setUsername(parsed.data);
      onSaved?.();
    } catch (failure) {
      setError(gameErrorMessage(failure));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <TextField
        label="Pseudo"
        name="username"
        autoComplete="username"
        required
        minLength={USERNAME_MIN_LENGTH}
        maxLength={USERNAME_MAX_LENGTH}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        hint="Affiché dans les classements. Lettres, chiffres, point et tirets."
        error={error ?? undefined}
      />
      <Button type="submit" disabled={isPending} aria-busy={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}
