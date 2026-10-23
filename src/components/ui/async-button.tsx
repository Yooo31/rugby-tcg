"use client";

import { useState, type ComponentProps } from "react";
import { Button } from "./button";

interface AsyncButtonProps extends Omit<
  ComponentProps<typeof Button>,
  "onClick"
> {
  readonly onAction: () => Promise<void>;
  /** Libellé affiché si l'action échoue, jusqu'au prochain essai. */
  readonly retryLabel?: string;
}

/** Bouton d'action asynchrone : se désactive pendant l'action et propose de réessayer en cas d'échec. */
export function AsyncButton({
  onAction,
  retryLabel = "Réessayer",
  disabled,
  children,
  ...props
}: AsyncButtonProps) {
  const [isPending, setIsPending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  const run = async () => {
    setIsPending(true);
    setHasFailed(false);
    try {
      await onAction();
    } catch {
      setHasFailed(true);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button
      {...props}
      onClick={run}
      disabled={disabled || isPending}
      aria-busy={isPending}
    >
      {hasFailed ? retryLabel : children}
    </Button>
  );
}
