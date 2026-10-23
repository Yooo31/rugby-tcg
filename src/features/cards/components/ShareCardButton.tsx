"use client";

import { Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { Club, Rarity } from "@/domain";

/** Partage la carte en image story (Instagram, WhatsApp…) ; sinon la télécharge. */
export function ShareCardButton({
  club,
  rarity,
}: {
  readonly club: Club;
  readonly rarity: Rarity;
}) {
  const [isPending, setIsPending] = useState(false);
  const url = `/partage/carte?club=${encodeURIComponent(club.id)}&rarete=${rarity}`;

  const share = async () => {
    setIsPending(true);
    try {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], `${club.id}.png`, { type: "image/png" });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: club.name });
        return;
      }
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      // Partage annulé ou impossible : rien à signaler.
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Button variant="secondary" onClick={share} disabled={isPending} block>
      <Share2 aria-hidden className="size-5" />
      Partager en story
    </Button>
  );
}
