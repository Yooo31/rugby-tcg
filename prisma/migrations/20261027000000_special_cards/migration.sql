-- Cartes spéciales (hors clubs) : l'Équipe de France, tirée une fois sur
-- cent mille boosters. Écrite à la main (voir 20261022000000_players_social_admin).

CREATE TABLE "owned_special_cards" (
    "player_id" UUID NOT NULL,
    "special_id" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "first_obtained_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owned_special_cards_pkey" PRIMARY KEY ("player_id", "special_id"),
    CONSTRAINT "owned_special_cards_count_check" CHECK ("count" >= 1)
);

ALTER TABLE "owned_special_cards" ADD CONSTRAINT "owned_special_cards_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
ALTER TABLE "owned_special_cards" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "owned_special_cards" FROM anon, authenticated;
