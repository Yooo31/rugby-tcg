import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry/options";

/** Démarrage du serveur : Sentry, côté Node.js comme côté edge. */
export function register() {
  Sentry.init(
    sentryOptions({
      dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"],
      // Sur Vercel, VERCEL_ENV vaut « production » ou « preview ».
      environment:
        process.env["SENTRY_ENVIRONMENT"] ?? process.env["VERCEL_ENV"],
    }),
  );
}

/** Erreurs des composants serveur, actions et routes : remontées à Sentry. */
export const onRequestError = Sentry.captureRequestError;
