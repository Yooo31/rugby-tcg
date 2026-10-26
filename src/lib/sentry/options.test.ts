import type { ErrorEvent } from "@sentry/nextjs";
import { scrubEvent, sentryOptions } from "./options";

describe("réglages Sentry", () => {
  it("reste éteint sans DSN, et n'envoie ni trace ni donnée personnelle", () => {
    expect(
      sentryOptions({ dsn: undefined, environment: undefined }),
    ).toMatchObject({
      enabled: false,
      environment: "production",
      tracesSampleRate: 0,
      sendDefaultPii: false,
    });
    expect(
      sentryOptions({
        dsn: "https://k@o1.ingest.sentry.io/2",
        environment: "preproduction",
      }),
    ).toMatchObject({
      enabled: true,
      environment: "preproduction",
    });
  });

  it("retire e-mail, adresse IP, cookies, en-têtes et contenu des requêtes", () => {
    const event = {
      type: undefined,
      user: { id: "joueur-1", email: "a@b.fr", ip_address: "1.2.3.4" },
      request: {
        url: "https://rugby-tcg.fr/boosters",
        cookies: { session: "secret" },
        headers: { Authorization: "Bearer x" },
        data: { password: "x" },
      },
    } as ErrorEvent;
    expect(scrubEvent(event)).toMatchObject({
      user: { id: "joueur-1", ip_address: null },
      request: { url: "https://rugby-tcg.fr/boosters" },
    });
    const scrubbed = scrubEvent(event);
    expect(scrubbed.user).not.toHaveProperty("email");
    expect(scrubbed.request).not.toHaveProperty("cookies");
    expect(scrubbed.request).not.toHaveProperty("headers");
    expect(scrubbed.request).not.toHaveProperty("data");
  });

  it("interdit toujours la déduction de l'adresse IP, même sans utilisateur", () => {
    expect(scrubEvent({ type: undefined } as ErrorEvent).user).toEqual({
      ip_address: null,
    });
    expect(
      scrubEvent({ type: undefined, user: { email: "a@b.fr" } } as ErrorEvent)
        .user,
    ).toEqual({ ip_address: null });
  });
});
