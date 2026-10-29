-- Cosmétiques (dos de carte, cadres, thèmes d'album) : possédés et équipés.
-- Écrite à la main (voir 20261022000000_players_social_admin). Les cosmétiques
-- de départ ne sont jamais enregistrés : une colonne nulle désigne celui de départ.

ALTER TABLE "players"
  ADD COLUMN "card_back" TEXT,
  ADD COLUMN "card_frame" TEXT,
  ADD COLUMN "album_theme" TEXT;

CREATE TABLE "owned_cosmetics" (
    "player_id" UUID NOT NULL,
    "cosmetic_id" TEXT NOT NULL,
    "obtained_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owned_cosmetics_pkey" PRIMARY KEY ("player_id", "cosmetic_id")
);

ALTER TABLE "owned_cosmetics" ADD CONSTRAINT "owned_cosmetics_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
ALTER TABLE "owned_cosmetics" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "owned_cosmetics" FROM anon, authenticated;
