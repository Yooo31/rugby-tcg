-- Pseudo des joueurs, journal des ouvertures, corrections d'administration
-- et cadeaux (giveaways).
--
-- Écrite à la main : `prisma migrate dev` et `migrate diff` refusent la clé
-- étrangère vers `auth.users` (schéma Supabase hors de Prisma). Elle doit
-- rester alignée sur prisma/schema.prisma ; `pnpm test:db` le vérifie.

-- ---------------------------------------------------------------------------
-- Pseudo
-- ---------------------------------------------------------------------------

ALTER TABLE "players" ADD COLUMN "username" TEXT;

-- Unique sans tenir compte de la casse : « Pilier » et « pilier » sont le même pseudo.
CREATE UNIQUE INDEX "players_username_lower_key" ON "players" (lower("username"));

-- Le format exact est validé par le domaine (Zod) ; la base garde la longueur.
ALTER TABLE "players"
  ADD CONSTRAINT "players_username_length_check"
    CHECK ("username" IS NULL OR char_length("username") BETWEEN 3 AND 20);

-- ---------------------------------------------------------------------------
-- Journal des ouvertures de boosters
-- ---------------------------------------------------------------------------

CREATE TABLE "booster_openings" (
    "id" BIGSERIAL NOT NULL,
    "player_id" UUID NOT NULL,
    "opened_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT NOT NULL,
    "cards" JSONB NOT NULL,

    CONSTRAINT "booster_openings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "booster_openings_source_check" CHECK ("source" IN ('free', 'bonus'))
);

CREATE INDEX "booster_openings_player_id_idx" ON "booster_openings"("player_id");
CREATE INDEX "booster_openings_opened_at_idx" ON "booster_openings"("opened_at");

ALTER TABLE "booster_openings" ADD CONSTRAINT "booster_openings_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Corrections d'administration
-- ---------------------------------------------------------------------------

CREATE TABLE "admin_adjustments" (
    "id" BIGSERIAL NOT NULL,
    "player_id" UUID NOT NULL,
    "admin_email" TEXT NOT NULL,
    "ingots_delta" INTEGER NOT NULL,
    "boosters_delta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_adjustments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "admin_adjustments_not_empty_check"
      CHECK ("ingots_delta" <> 0 OR "boosters_delta" <> 0),
    CONSTRAINT "admin_adjustments_reason_check" CHECK (char_length("reason") > 0)
);

CREATE INDEX "admin_adjustments_player_id_idx" ON "admin_adjustments"("player_id");

ALTER TABLE "admin_adjustments" ADD CONSTRAINT "admin_adjustments_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Cadeaux
-- ---------------------------------------------------------------------------

CREATE TABLE "giveaways" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "ingots" INTEGER NOT NULL DEFAULT 0,
    "boosters" INTEGER NOT NULL DEFAULT 0,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "giveaways_period_check" CHECK ("ends_at" > "starts_at"),
    CONSTRAINT "giveaways_reward_check"
      CHECK ("ingots" >= 0 AND "boosters" >= 0 AND "ingots" + "boosters" > 0)
);

CREATE INDEX "giveaways_starts_at_ends_at_idx" ON "giveaways"("starts_at", "ends_at");

CREATE TABLE "claimed_giveaways" (
    "player_id" UUID NOT NULL,
    "giveaway_id" UUID NOT NULL,
    "claimed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claimed_giveaways_pkey" PRIMARY KEY ("player_id", "giveaway_id")
);

CREATE INDEX "claimed_giveaways_giveaway_id_idx" ON "claimed_giveaways"("giveaway_id");

ALTER TABLE "claimed_giveaways" ADD CONSTRAINT "claimed_giveaways_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "claimed_giveaways" ADD CONSTRAINT "claimed_giveaways_giveaway_id_fkey"
  FOREIGN KEY ("giveaway_id") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
-- ---------------------------------------------------------------------------

ALTER TABLE "booster_openings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_adjustments" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "giveaways" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "claimed_giveaways" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "booster_openings", "admin_adjustments", "giveaways", "claimed_giveaways"
  FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "booster_openings_id_seq", "admin_adjustments_id_seq"
  FROM anon, authenticated;
