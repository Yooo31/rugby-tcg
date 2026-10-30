"use client";

import { useModalDialog } from "@/components/ui/use-modal-dialog";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  productLabel,
  productPriceCents,
  type PurchaseProduct,
} from "@/domain";
import { formatEuros } from "@/lib/money";
import { TERMS_OF_SALE_PATH } from "@/lib/supabase/routes";
import { cn } from "@/lib/utils";
import { startCheckout, type CheckoutResult } from "../server/actions";

type CheckoutError = Extract<CheckoutResult, { ok: false }>["error"];

const ERROR_MESSAGES: Record<CheckoutError, string> = {
  unavailable: "Le paiement n'est pas disponible pour le moment.",
  invalid: "Cet achat n'est plus proposé. Rechargez la page.",
  "waiver-required": "Cochez la case pour continuer.",
  "already-owned": "Vous l'avez déjà.",
  "rate-limited": "Trop de tentatives : réessayez dans une minute.",
};

interface CheckoutButtonProps {
  readonly product: PurchaseProduct;
  readonly className?: string;
  readonly variant?: "primary" | "secondary";
}

/**
 * Bouton d'achat en euros : demande la renonciation au délai de rétractation
 * (contenu fourni tout de suite), puis ouvre la page de paiement Stripe.
 */
export function CheckoutButton({
  product,
  className,
  variant = "secondary",
}: CheckoutButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const price = formatEuros(productPriceCents(product));
  return (
    <>
      <Button
        variant={variant}
        block
        onClick={() => setIsOpen(true)}
        aria-label={`Acheter ${productLabel(product)} pour ${price}`}
        className={className}
      >
        {price}
      </Button>
      <CheckoutDialog
        product={product}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
}

function CheckoutDialog({
  product,
  isOpen,
  onClose,
}: {
  readonly product: PurchaseProduct;
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const dialogProps = useModalDialog(isOpen, onClose);
  const checkboxId = useId();
  const [waives, setWaives] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const label = productLabel(product);
  const price = formatEuros(productPriceCents(product));

  // Retour depuis Stripe par « Précédent » : la page restaurée doit pouvoir
  // relancer un paiement.
  useEffect(() => {
    const reset = (event: PageTransitionEvent) => {
      if (event.persisted) setIsPending(false);
    };
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  const pay = async () => {
    setIsPending(true);
    setError(null);
    try {
      const result = await startCheckout(product, waives);
      if (result.ok) {
        // Page de paiement chez Stripe : on quitte le jeu le temps de payer.
        window.location.assign(result.url);
        return;
      }
      setError(ERROR_MESSAGES[result.error]);
    } catch {
      setError(ERROR_MESSAGES.unavailable);
    }
    setIsPending(false);
  };

  return (
    <dialog
      {...dialogProps}
      aria-label={`Acheter : ${label}`}
      className="text-chalk m-auto w-full max-w-sm bg-transparent p-4 backdrop:bg-black/80 backdrop:backdrop-blur-sm"
    >
      {isOpen ? (
        <div className="panel flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">Paiement sécurisé par Stripe</p>
              <h2 className="text-2xl font-bold">{label}</h2>
              <p className="font-display text-3xl font-bold tabular-nums">
                {price}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="border-line-strong bg-surface-raised hover:bg-surface-hover grid size-11 shrink-0 place-items-center rounded-full border transition"
            >
              <X aria-hidden className="size-5" />
              <span className="sr-only">Fermer</span>
            </button>
          </div>
          <label
            htmlFor={checkboxId}
            className="flex items-start gap-3 text-sm text-pretty"
          >
            <input
              id={checkboxId}
              type="checkbox"
              checked={waives}
              onChange={(event) => setWaives(event.target.checked)}
              className="accent-pitch mt-0.5 size-5 shrink-0"
            />
            <span>
              Je demande à recevoir mon achat tout de suite et je renonce à mon
              droit de rétractation de quatorze jours. J&apos;accepte les{" "}
              <Link
                href={TERMS_OF_SALE_PATH}
                target="_blank"
                className="text-pitch underline underline-offset-2"
              >
                conditions de vente
              </Link>
              .
            </span>
          </label>
          {error ? (
            <p role="alert" className="text-danger text-sm">
              {error}
            </p>
          ) : null}
          <Button
            block
            onClick={pay}
            disabled={!waives || isPending}
            aria-busy={isPending}
            className={cn(isPending && "opacity-80")}
          >
            {isPending ? "Ouverture du paiement…" : `Payer ${price}`}
          </Button>
          <p className="text-chalk-muted text-xs text-pretty">
            Vous allez être redirigé vers la page de paiement de Stripe. Nous ne
            voyons jamais vos coordonnées bancaires.
          </p>
        </div>
      ) : null}
    </dialog>
  );
}
