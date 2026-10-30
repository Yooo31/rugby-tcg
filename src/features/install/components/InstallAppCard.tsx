"use client";

import { Share, SquarePlus, Smartphone, X } from "lucide-react";
import { useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInstallMode } from "../hooks/useInstallMode";

/** Choix « Plus tard » sur l'accueil, gardé sur cet appareil. */
const DISMISSED_KEY = "rugby-tcg:install-dismissed";

// Le masquage est gardé hors de React, et relu par useSyncExternalStore.
let dismissedThisVisit = false;
const dismissListeners = new Set<() => void>();

function subscribeDismissed(listener: () => void) {
  dismissListeners.add(listener);
  return () => dismissListeners.delete(listener);
}

function readDismissed(): boolean {
  if (dismissedThisVisit) return true;
  try {
    return window.localStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function dismiss() {
  dismissedThisVisit = true;
  try {
    window.localStorage.setItem(DISMISSED_KEY, "1");
  } catch {
    // Stockage indisponible (navigation privée) : masqué pour cette visite.
  }
  dismissListeners.forEach((listener) => listener());
}

interface InstallAppCardProps {
  /** Sur l'accueil, le joueur peut masquer la carte ; dans Compte, elle reste. */
  readonly dismissible?: boolean;
  readonly className?: string;
}

/** Propose d'installer le jeu sur l'écran d'accueil, en mode application. */
export function InstallAppCard({
  dismissible = false,
  className,
}: InstallAppCardProps) {
  const { mode, install } = useInstallMode();
  const wasDismissed = useSyncExternalStore(
    subscribeDismissed,
    readDismissed,
    () => true,
  );
  const isDismissed = dismissible && wasDismissed;

  if (mode === null || mode === "installed" || mode === "unavailable")
    return null;
  if (isDismissed) return null;

  return (
    <section
      aria-labelledby="install-title"
      className={cn("panel flex flex-col gap-3 p-5", className)}
    >
      <div className="flex items-start gap-3">
        <Smartphone aria-hidden className="text-pitch size-8 shrink-0" />
        <div className="min-w-0 flex-1">
          <h2 id="install-title" className="text-2xl font-extrabold">
            Installer l&apos;application
          </h2>
          <p className="text-chalk-muted mt-1 text-sm text-pretty">
            Le jeu en plein écran depuis votre écran d&apos;accueil, et les
            notifications quand vos boosters sont prêts.
          </p>
        </div>
        {dismissible ? (
          <button
            type="button"
            onClick={dismiss}
            className="text-chalk-muted hover:text-chalk -m-2 grid size-11 shrink-0 place-items-center"
          >
            <X aria-hidden className="size-5" />
            <span className="sr-only">Plus tard</span>
          </button>
        ) : null}
      </div>
      {mode === "prompt" ? (
        <Button onClick={() => void install()} className="sm:self-start">
          Installer
        </Button>
      ) : (
        <ol className="text-chalk-muted flex flex-col gap-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-chalk font-bold">1.</span>
            Dans Safari, touchez
            <Share
              aria-label="Partager"
              className="text-chalk size-5 shrink-0"
            />
          </li>
          <li className="flex items-center gap-2">
            <span className="text-chalk font-bold">2.</span>
            Choisissez « Sur l&apos;écran d&apos;accueil »
            <SquarePlus aria-hidden className="text-chalk size-5 shrink-0" />
          </li>
          <li className="flex items-center gap-2">
            <span className="text-chalk font-bold">3.</span>
            Ouvrez Rugby TCG depuis son icône.
          </li>
        </ol>
      )}
    </section>
  );
}
