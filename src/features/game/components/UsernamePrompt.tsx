"use client";

import type { ReadyGame } from "../GameProvider";
import { UsernameForm } from "./UsernameForm";

/** Demandé une fois aux joueurs sans pseudo (comptes créés avant les classements). */
export function UsernamePrompt({ game }: { readonly game: ReadyGame }) {
  return (
    <section
      aria-labelledby="username-prompt"
      className="panel mx-auto flex w-full max-w-md flex-col gap-5 p-6"
    >
      <div>
        <p className="eyebrow text-pitch">Avant le coup d&apos;envoi</p>
        <h1 id="username-prompt" className="mt-1 text-4xl font-extrabold">
          Choisissez votre pseudo
        </h1>
        <p className="text-chalk-muted mt-2 text-sm text-pretty">
          Il vous représente dans les classements. Votre adresse e-mail n&apos;y
          apparaît jamais.
        </p>
      </div>
      <UsernameForm game={game} submitLabel="Entrer sur le terrain" />
    </section>
  );
}
