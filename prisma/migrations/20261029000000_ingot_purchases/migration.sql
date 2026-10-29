-- Paquets de lingots payés. Écrite à la main (voir 20261022000000_players_social_admin).
-- `reference` (identifiant du paiement) est unique : un paiement ne crédite qu'une fois.

CREATE TABLE "ingot_purchases" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "pack_id" TEXT NOT NULL,
    "ingots" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "reference" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ingot_purchases_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ingot_purchases_ingots_check" CHECK ("ingots" > 0),
    CONSTRAINT "ingot_purchases_price_cents_check" CHECK ("price_cents" > 0)
);

CREATE UNIQUE INDEX "ingot_purchases_reference_key" ON "ingot_purchases"("reference");
CREATE INDEX "ingot_purchases_player_id_idx" ON "ingot_purchases"("player_id");

ALTER TABLE "ingot_purchases" ADD CONSTRAINT "ingot_purchases_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
ALTER TABLE "ingot_purchases" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ingot_purchases" FROM anon, authenticated;
