"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

/** Dernier filet : une erreur qui casse toute la page est remontée à Sentry. */
export default function GlobalError({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="fr">
      <body className="flex min-h-dvh items-center justify-center p-6">
        <main className="panel flex max-w-sm flex-col items-center gap-4 p-6 text-center">
          <h1 className="text-3xl font-extrabold">Carton rouge</h1>
          <p className="text-chalk-muted text-sm text-pretty">
            Une erreur inattendue a interrompu le jeu. Elle nous a été signalée.
          </p>
          <button
            type="button"
            onClick={reset}
            className="bg-pitch text-night rounded-control font-display min-h-12 px-5 font-bold uppercase"
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
