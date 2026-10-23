import {
  contentSecurityPolicy,
  securityContextFrom,
  securityHeaders,
} from "./security-headers";

describe("en-têtes de sécurité", () => {
  it("n'exige HTTPS pour les ressources que sur un site en HTTPS", () => {
    expect(
      securityContextFrom({ NEXT_PUBLIC_SITE_URL: "https://rugby-tcg.fr" })
        .isHttpsSite,
    ).toBe(true);
    expect(
      securityContextFrom({ NEXT_PUBLIC_SITE_URL: "http://localhost:3200" })
        .isHttpsSite,
    ).toBe(false);
    expect(securityContextFrom({}).isHttpsSite).toBe(false);

    expect(
      contentSecurityPolicy({ isDev: false, isHttpsSite: true }),
    ).toContain("upgrade-insecure-requests");
    expect(
      contentSecurityPolicy({ isDev: false, isHttpsSite: false }),
    ).not.toContain("upgrade-insecure-requests");
  });

  it("n'autorise eval qu'en développement", () => {
    expect(securityContextFrom({ NODE_ENV: "development" }).isDev).toBe(true);
    expect(
      contentSecurityPolicy({ isDev: true, isHttpsSite: false }),
    ).toContain("'unsafe-eval'");
    expect(
      contentSecurityPolicy({ isDev: false, isHttpsSite: false }),
    ).not.toContain("'unsafe-eval'");
  });

  it("interdit l'affichage dans un cadre et les ressources d'autres sites", () => {
    const headers = securityHeaders({ isDev: false, isHttpsSite: true });
    const csp = headers.find(
      (header) => header.key === "Content-Security-Policy",
    )?.value;
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("default-src 'self'");
    expect(headers).toContainEqual({ key: "X-Frame-Options", value: "DENY" });
  });
});
