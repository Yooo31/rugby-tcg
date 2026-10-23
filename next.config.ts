import type { NextConfig } from "next";
import {
  securityContextFrom,
  securityHeaders,
} from "./src/lib/security-headers";

const SECURITY_HEADERS = securityHeaders(securityContextFrom(process.env));

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
