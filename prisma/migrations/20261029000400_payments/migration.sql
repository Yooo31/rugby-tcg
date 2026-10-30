-- Paiements Stripe : remboursements, et voie payante de saison achetable.
ALTER TABLE "ingot_purchases" ADD COLUMN "refunded_at" TIMESTAMPTZ;
ALTER TABLE "vip_memberships" ADD COLUMN "refunded_at" TIMESTAMPTZ;

ALTER TABLE "season_passes" ALTER COLUMN "granted_by" DROP NOT NULL;
ALTER TABLE "season_passes" ADD COLUMN "reference" TEXT;
ALTER TABLE "season_passes" ADD COLUMN "price_cents" INTEGER;
ALTER TABLE "season_passes" ADD COLUMN "refunded_at" TIMESTAMPTZ;
CREATE UNIQUE INDEX "season_passes_reference_key" ON "season_passes"("reference");
-- Achetée (paiement et prix) ou offerte (administrateur), jamais rien.
ALTER TABLE "season_passes" ADD CONSTRAINT "season_passes_origin_check" CHECK (
  ("reference" IS NOT NULL AND "price_cents" IS NOT NULL) OR "granted_by" IS NOT NULL
);

-- Une ligne par don ou par achat, jamais réécrite : un paiement remboursé
-- garde sa référence, et son événement relivré ne peut rien réactiver.
ALTER TABLE "season_passes" ADD COLUMN "id" UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE "season_passes" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "season_passes" DROP CONSTRAINT "season_passes_pkey";
ALTER TABLE "season_passes" ADD CONSTRAINT "season_passes_pkey" PRIMARY KEY ("id");
CREATE INDEX "season_passes_player_id_idx" ON "season_passes"("player_id");
-- Une seule voie payante active par joueur et par saison.
CREATE UNIQUE INDEX "season_passes_active_key" ON "season_passes"("player_id", "season_id")
  WHERE "refunded_at" IS NULL;
