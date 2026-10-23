"use client";

import { useEffect } from "react";

/** Enregistre le service worker (coquille hors-ligne). En production uniquement. */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    // Un échec d'enregistrement ne doit jamais gêner le jeu : l'app marche sans.
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .catch(() => undefined);
  }, []);

  return null;
}
