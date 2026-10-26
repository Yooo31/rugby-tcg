/** Contexte qui change la politique : mode de développement, site en HTTPS. */
export interface SecurityContext {
  /** `next dev` : le rechargement à chaud a besoin d'`eval`. */
  readonly isDev: boolean;
  /**
   * Site servi en HTTPS (production) : on peut exiger HTTPS pour toute
   * ressource. Pas sur un serveur local en HTTP (tests de bout en bout), où
   * cette règle ferait échouer les requêtes.
   */
  readonly isHttpsSite: boolean;
}

/** Lit le contexte dans les variables d'environnement de `next.config.ts`. */
export function securityContextFrom(
  env: Readonly<Record<string, string | undefined>>,
): SecurityContext {
  return {
    isDev: env["NODE_ENV"] === "development",
    isHttpsSite: (env["NEXT_PUBLIC_SITE_URL"] ?? "").startsWith("https://"),
  };
}

/**
 * Politique de sécurité du contenu, sans nonce : un nonce rendrait chaque page
 * dynamique et ferait perdre le pré-rendu. Les scripts en ligne restent donc
 * permis (Next en injecte lui-même), mais rien ne se charge depuis un autre
 * site, la page ne peut pas être affichée dans un cadre, et les formulaires
 * ne partent que vers le site lui-même. Le navigateur ne parle qu'au site :
 * Supabase n'est appelé que par le serveur.
 */
export function contentSecurityPolicy({
  isDev,
  isHttpsSite,
}: SecurityContext): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' blob: data:",
    "font-src 'self'",
    "connect-src 'self'",
    "worker-src 'self'",
    "manifest-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(isHttpsSite ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

/** En-têtes de sécurité envoyés sur toutes les pages. */
export function securityHeaders(
  context: SecurityContext,
): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(context) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    },
    // HTTPS obligatoire pendant deux ans (ignoré par les navigateurs en HTTP local).
    {
      key: "Strict-Transport-Security",
      value: "max-age=63072000; includeSubDomains",
    },
  ];
}
