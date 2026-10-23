import * as Sentry from "@sentry/nextjs";
import { sentryOptions } from "@/lib/sentry/options";

// Erreurs du navigateur, envoyées par la route relais du site (CSP inchangée).
Sentry.init(
  sentryOptions({
    dsn: process.env["NEXT_PUBLIC_SENTRY_DSN"],
    environment: process.env["NEXT_PUBLIC_SENTRY_ENVIRONMENT"],
  }),
);

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
