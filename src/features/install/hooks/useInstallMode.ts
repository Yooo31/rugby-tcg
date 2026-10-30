"use client";

import { useSyncExternalStore } from "react";
import { installMode, type InstallMode } from "../lib/install";

/** Invite d'installation de Chrome (absente des types du DOM). */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ readonly outcome: "accepted" | "dismissed" }>;
}

// L'invite peut arriver avant l'affichage de l'écran : on la garde dès le
// chargement du module, pour la ressortir au clic.
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let wasInstalled = false;
/** Change à chaque événement : React relit alors l'invite et l'installation. */
let version = 0;
const listeners = new Set<() => void>();
const notify = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};

let isListening = false;

/**
 * Écoute l'invite d'installation, une seule fois par page. Appelée par la
 * coquille du jeu sur toutes les pages : l'invite peut arriver n'importe où,
 * avant même l'affichage de la carte d'installation.
 */
export function listenForInstallPrompt(): void {
  if (isListening || typeof window === "undefined") return;
  isListening = true;
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event as BeforeInstallPromptEvent;
    notify();
  });
  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    wasInstalled = true;
    notify();
  });
}

listenForInstallPrompt();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getVersion = () => version;
const getServerVersion = () => -1;

/**
 * Comment proposer l'installation sur cet appareil ; `null` tant que la page
 * n'est pas affichée dans le navigateur (rendu serveur).
 */
export function useInstallMode(): {
  readonly mode: InstallMode | null;
  readonly install: () => Promise<void>;
} {
  useSyncExternalStore(subscribe, getVersion, getServerVersion);
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const mode = isClient
    ? installMode({
        userAgent: navigator.userAgent,
        maxTouchPoints: navigator.maxTouchPoints,
        isStandalone:
          wasInstalled ||
          (window.matchMedia?.("(display-mode: standalone)").matches ?? false),
        hasPrompt: deferredPrompt !== null,
      })
    : null;

  const install = async () => {
    const pending = deferredPrompt;
    if (!pending) return;
    try {
      await pending.prompt();
      await pending.userChoice;
    } catch {
      // Invite refusée par le navigateur : le joueur pourra installer par le menu.
    } finally {
      // Une invite ne sert qu'une fois, qu'elle aboutisse ou non.
      deferredPrompt = null;
      notify();
    }
  };

  return { mode, install };
}
