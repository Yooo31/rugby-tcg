-- Promotions réelles et limitées dans le temps, programmées dans l'admin.
CREATE TABLE "promotions" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "percent_off" INTEGER NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "promotions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "promotions_percent_check" CHECK ("percent_off" BETWEEN 1 AND 50),
    CONSTRAINT "promotions_period_check" CHECK ("ends_at" > "starts_at")
);

CREATE INDEX "promotions_starts_at_ends_at_idx" ON "promotions"("starts_at", "ends_at");

-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
ALTER TABLE "promotions" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "promotions" FROM anon, authenticated;
