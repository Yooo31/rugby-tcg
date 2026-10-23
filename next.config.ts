import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Politique de sécurité du contenu, sans nonce : un nonce rendrait chaque page
 * dynamique et ferait perdre le pré-rendu. Les scripts en ligne restent donc
 * permis (Next en injecte lui-même), mais rien ne se charge depuis un autre
 * site, la page ne peut pas être affichée dans un cadre, et les formulaires
 * ne partent que vers le site lui-même. Le navigateur ne parle qu'au site :
 * Supabase n'est appelé que par le serveur.
 */
const CONTENT_SECURITY_POLICY = [
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
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
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

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // La pastille de développement recouvrait le premier onglet de la barre mobile.
  devIndicators: { position: "top-right" },
  turbopack: {
    rules: {
      "*.css": {
        // Tailwind ne traite que le CSS global : les CSS Modules doivent garder
        // leur traitement natif, sinon leurs classes ne sont plus exportées.
        condition: { not: { path: /\.module\.css$/ } },
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Ne pas annoncer la technologie du serveur.
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/(.*)", headers: SECURITY_HEADERS },
      {
        // Le service worker ne doit jamais être servi depuis un cache.
        source: "/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
