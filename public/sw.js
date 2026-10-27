// Service worker minimal.
// - fichiers statiques versionnés (/_next/static, icônes) : cache d'abord ;
// - navigations : réseau seulement. Les pages contiennent l'état du joueur :
//   les garder en cache les laisserait lisibles après déconnexion (RGPD).
//   Hors-ligne, une page simple invite à se reconnecter.
// - notifications : affichage et ouverture du jeu au clic.
const CACHE = "rugby-tcg-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

const isStaticAsset = (url) => url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/");

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

const OFFLINE_PAGE = `<!doctype html><html lang="fr"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Hors-jeu · Rugby TCG</title>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#05080a;color:#eef2f0;font-family:system-ui,sans-serif;text-align:center;padding:24px">
<div><h1 style="margin:0 0 8px">Hors-jeu</h1><p style="color:#9aa5a0">Pas de connexion. Le jeu revient dès que le réseau est de retour.</p></div>
</body></html>`;

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(OFFLINE_PAGE, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}

/** Seules les lectures du site lui-même passent par le service worker. */
function isOwnRead(request, url) {
  return request.method === "GET" && url.origin === self.location.origin;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (!isOwnRead(request, url)) return;

  if (isStaticAsset(url)) event.respondWith(cacheFirst(request));
  else if (request.mode === "navigate") event.respondWith(networkOnly(request));
});

// Notifications envoyées par le serveur : { title, body, url }.
self.addEventListener("push", (event) => {
  let message = { title: "Rugby TCG", body: "", url: "/" };
  try {
    message = { ...message, ...event.data.json() };
  } catch {
    // Contenu illisible : on garde le message par défaut.
  }
  event.waitUntil(
    self.registration.showNotification(message.title, {
      body: message.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: message.url },
    }),
  );
});

// Au clic : on revient sur un onglet du jeu s'il y en a un, sinon on l'ouvre.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const path = event.notification.data?.url ?? "/";
  // Seulement un chemin du site : jamais une adresse extérieure.
  const target = new URL(path.startsWith("/") ? path : "/", self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((client) => client.url.startsWith(self.location.origin));
      if (open) return open.navigate(target).then((client) => client?.focus());
      return self.clients.openWindow(target);
    }),
  );
});
