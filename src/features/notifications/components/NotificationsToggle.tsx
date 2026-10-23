"use client";

import { Bell, BellOff } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  currentSubscription,
  pushSupport,
  subscribeDevice,
  type PushSupport,
} from "../lib/push";
import { subscribePush, unsubscribePush } from "../server/actions";

type State =
  | { readonly status: "loading" }
  | { readonly status: "unavailable"; readonly support: PushSupport }
  | { readonly status: "denied" }
  | { readonly status: "off" }
  | { readonly status: "on"; readonly endpoint: string };

const PUBLIC_KEY = process.env["NEXT_PUBLIC_VAPID_PUBLIC_KEY"] ?? "";

/** État des notifications sur cet appareil, lu au chargement. */
async function detectState(): Promise<State> {
  const support = pushSupport();
  if (support !== "supported" || !PUBLIC_KEY)
    return { status: "unavailable", support };
  if (Notification.permission === "denied") return { status: "denied" };
  try {
    const subscription = await currentSubscription();
    return subscription
      ? { status: "on", endpoint: subscription.endpoint }
      : { status: "off" };
  } catch {
    return { status: "off" };
  }
}

/** Activer ou couper les notifications de cet appareil. */
export function NotificationsToggle() {
  const [state, setState] = useState<State>({ status: "loading" });
  const [isPending, setIsPending] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    let isCurrent = true;
    detectState().then((detected) => {
      if (isCurrent) setState(detected);
    });
    return () => {
      isCurrent = false;
    };
  }, []);

  const enable = async () => {
    setIsPending(true);
    setHasFailed(false);
    try {
      const subscription = await subscribeDevice(PUBLIC_KEY);
      if (!subscription) {
        setState({
          status: Notification.permission === "denied" ? "denied" : "off",
        });
        return;
      }
      if (!(await subscribePush(subscription.toJSON())))
        throw new Error("Abonnement refusé par le serveur.");
      setState({ status: "on", endpoint: subscription.endpoint });
    } catch {
      setHasFailed(true);
    } finally {
      setIsPending(false);
    }
  };

  const disable = async () => {
    if (state.status !== "on") return;
    setIsPending(true);
    try {
      const subscription = await currentSubscription();
      await subscription?.unsubscribe();
      await unsubscribePush(state.endpoint);
      setState({ status: "off" });
    } finally {
      setIsPending(false);
    }
  };

  if (state.status === "loading") return <div className="skeleton h-12" />;
  if (state.status === "unavailable")
    return (
      <p className="text-chalk-muted text-sm text-pretty">
        {state.support === "install-first"
          ? "Pour recevoir les notifications sur iPhone, ajoutez d'abord le jeu à l'écran d'accueil (Partager, puis « Sur l'écran d'accueil »)."
          : "Ce navigateur ne permet pas les notifications."}
      </p>
    );
  if (state.status === "denied")
    return (
      <p className="text-chalk-muted text-sm text-pretty">
        Les notifications sont bloquées pour ce site. Autorisez-les dans les
        réglages du navigateur pour les activer.
      </p>
    );

  return (
    <div className="flex flex-col gap-2">
      <p className="text-chalk-muted text-sm text-pretty">
        Quand vos boosters gratuits sont prêts, et le soir si votre série va se
        perdre. Jamais entre 22 h et 8 h.
      </p>
      {state.status === "on" ? (
        <Button
          variant="secondary"
          onClick={disable}
          disabled={isPending}
          block
        >
          <BellOff aria-hidden className="size-5" />
          Couper les notifications
        </Button>
      ) : (
        <Button
          onClick={enable}
          disabled={isPending}
          aria-busy={isPending}
          block
        >
          <Bell aria-hidden className="size-5" />
          {hasFailed ? "Réessayer" : "Activer les notifications"}
        </Button>
      )}
    </div>
  );
}
