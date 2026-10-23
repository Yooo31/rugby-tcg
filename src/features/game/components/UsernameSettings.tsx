"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GameGate } from "../GameGate";
import { UsernameForm } from "./UsernameForm";

/** Pseudo du joueur sur la page Compte, modifiable. */
export function UsernameSettings() {
  const [isEditing, setIsEditing] = useState(false);
  return (
    <GameGate fallback={<div className="skeleton h-12" />}>
      {(game) =>
        isEditing ? (
          <UsernameForm
            game={game}
            submitLabel="Enregistrer"
            onSaved={() => setIsEditing(false)}
          />
        ) : (
          <div className="flex items-center justify-between gap-3">
            <p className="truncate text-lg font-medium">{game.username}</p>
            <Button
              variant="secondary"
              onClick={() => setIsEditing(true)}
              className="shrink-0"
            >
              Modifier
            </Button>
          </div>
        )
      }
    </GameGate>
  );
}
