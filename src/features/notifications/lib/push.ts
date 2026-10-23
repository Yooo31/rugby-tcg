/**
 * Abonnement aux notifications côté navigateur (Web Push). Sur iPhone, les
 * notifications ne marchent que si le jeu est installé sur l'écran d'accueil.
 */

/** Clé publique VAPID (base64 url) → octets attendus par `pushManager.subscribe`. */
export function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(new ArrayBuffer(binary.length));
  for (let index = 0; index < binary.length; index += 1)
    bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export type PushSupport = "supported" | "install-first" | "unsupported";

/** Le navigateur sait-il recevoir des notifications, et faut-il d'abord installer l'app ? */
export function pushSupport(): PushSupport {
  if (typeof window === "undefined") return "unsupported";
  const hasApi =
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;
  const isIos = /iPhone|iPad|iPod/.test(navigator.userAgent);
  const isInstalled =
    window.matchMedia?.("(display-mode: standalone)").matches ?? false;
  if (isIos && !isInstalled) return "install-first";
  return hasApi ? "supported" : "unsupported";
}

export async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.getSubscription();
}

/** Demande l'autorisation puis abonne l'appareil ; `null` si le joueur refuse. */
export async function subscribeDevice(
  publicKey: string,
): Promise<PushSubscription | null> {
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;
  const registration = await navigator.serviceWorker.ready;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: base64UrlToBytes(publicKey),
  });
}
