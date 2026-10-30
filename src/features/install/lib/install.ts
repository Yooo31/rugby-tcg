/**
 * Installer le jeu sur l'écran d'accueil (application web, « PWA »).
 * Android et Chrome proposent une invite native ; sur iPhone, il faut passer
 * par le menu Partager de Safari, et c'est aussi la condition pour recevoir
 * les notifications.
 */

export type InstallMode =
  /** Déjà ouvert en mode application : rien à proposer. */
  | "installed"
  /** Le navigateur a fourni une invite d'installation. */
  | "prompt"
  /** iPhone ou iPad : explication pas à pas. */
  | "ios"
  /** Ni invite ni marche à suivre connue (navigateur de bureau, déjà refusé…). */
  | "unavailable";

export interface InstallContext {
  readonly userAgent: string;
  /** `navigator.maxTouchPoints` : un iPad récent se présente comme un Mac. */
  readonly maxTouchPoints: number;
  readonly isStandalone: boolean;
  readonly hasPrompt: boolean;
}

export function isIosDevice({
  userAgent,
  maxTouchPoints,
}: Pick<InstallContext, "userAgent" | "maxTouchPoints">): boolean {
  if (/iPhone|iPad|iPod/.test(userAgent)) return true;
  return /Macintosh/.test(userAgent) && maxTouchPoints > 1;
}

export function installMode(context: InstallContext): InstallMode {
  if (context.isStandalone) return "installed";
  if (context.hasPrompt) return "prompt";
  if (isIosDevice(context)) return "ios";
  return "unavailable";
}
