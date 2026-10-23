"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "./button";

/** Durée d'affichage de « Copié », en millisecondes. */
const COPIED_FEEDBACK_MS = 2000;

interface ShareButtonProps {
  readonly title: string;
  readonly text: string;
  readonly url: string;
  readonly label?: string;
}

/**
 * Partage natif du téléphone (WhatsApp, Messages…) quand il existe ; sinon
 * copie du lien dans le presse-papiers.
 */
export function ShareButton({
  title,
  text,
  url,
  label = "Partager",
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
      } catch {
        // Partage annulé par le joueur : rien à faire.
      }
      return;
    }
    await navigator.clipboard.writeText(`${text} ${url}`);
    setCopied(true);
    setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
  };

  return (
    <Button type="button" variant="secondary" onClick={share} block>
      {copied ? (
        <Check aria-hidden className="size-5" />
      ) : (
        <Share2 aria-hidden className="size-5" />
      )}
      {copied ? "Lien copié" : label}
    </Button>
  );
}
