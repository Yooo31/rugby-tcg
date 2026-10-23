import type { ErrorEvent } from "@sentry/nextjs";

/**
 * Réglages Sentry communs au navigateur et au serveur. Offre gratuite :
 * erreurs seulement (ni traces de performance, ni enregistrement de session).
 * Aucune donnée personnelle : ni e-mail, ni adresse IP, ni cookie, ni en-tête.
 */

/** Erreurs envoyées : toutes (le quota gratuit suffit à l'échelle du jeu). */
const ERROR_SAMPLE_RATE = 1;

export interface SentryEnv {
  readonly dsn: string | undefined;
  readonly environment: string | undefined;
}

/** Sentry n'est actif que si un DSN est configuré (jamais en CI ni en local par défaut). */
export function sentryOptions({ dsn, environment }: SentryEnv) {
  return {
    dsn,
    enabled: Boolean(dsn),
    environment: environment ?? "production",
    sampleRate: ERROR_SAMPLE_RATE,
    tracesSampleRate: 0,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
  };
}

/** Retire de l'événement tout ce qui pourrait identifier un joueur. */
export function scrubEvent(event: ErrorEvent): ErrorEvent {
  const scrubbed: ErrorEvent = { ...event };
  // L'identifiant technique suffit pour regrouper les erreurs d'un joueur.
  // `ip_address: null` interdit à Sentry de déduire l'adresse IP (et la
  // localisation) à la réception : sans lui, il le fait pour le navigateur.
  scrubbed.user = {
    ...(scrubbed.user?.id ? { id: scrubbed.user.id } : {}),
    ip_address: null,
  };
  if (scrubbed.request) {
    const request = { ...scrubbed.request };
    delete request.cookies;
    delete request.headers;
    delete request.data;
    scrubbed.request = request;
  }
  return scrubbed;
}
