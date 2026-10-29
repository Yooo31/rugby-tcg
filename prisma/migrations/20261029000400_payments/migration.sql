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
