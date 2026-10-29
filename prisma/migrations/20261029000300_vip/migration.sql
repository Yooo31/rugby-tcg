-- Pass VIP : périodes d'adhésion et booster VIP du jour.
ALTER TABLE "players" ADD COLUMN "vip_booster_day" TEXT;

CREATE TABLE "vip_memberships" (
    "id" UUID NOT NULL,
    "player_id" UUID NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "offer_id" TEXT,
    "price_cents" INTEGER,
    "reference" TEXT,
    "granted_by" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vip_memberships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "vip_memberships_period_check" CHECK ("ends_at" > "starts_at"),
    -- Achetée (offre et paiement) ou offerte (administrateur), jamais rien.
    CONSTRAINT "vip_memberships_origin_check" CHECK (
      ("reference" IS NOT NULL AND "offer_id" IS NOT NULL AND "price_cents" IS NOT NULL)
      OR "granted_by" IS NOT NULL
    )
);

CREATE UNIQUE INDEX "vip_memberships_reference_key" ON "vip_memberships"("reference");
CREATE INDEX "vip_memberships_player_id_idx" ON "vip_memberships"("player_id");

ALTER TABLE "vip_memberships" ADD CONSTRAINT "vip_memberships_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
ALTER TABLE "vip_memberships" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "vip_memberships" FROM anon, authenticated;
