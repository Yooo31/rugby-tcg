-- Série de connexion, parrainage, notifications et limite de débit partagée.
-- Écrite à la main (voir 20261022000000_players_social_admin).

-- ---------------------------------------------------------------------------
-- Joueurs : série, parrainage, dernières notifications
-- ---------------------------------------------------------------------------

ALTER TABLE "players"
  ADD COLUMN "streak_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "streak_last_day" TEXT,
  ADD COLUMN "referral_code" TEXT,
  ADD COLUMN "referred_by" UUID,
  ADD COLUMN "referral_rewarded_at" TIMESTAMPTZ,
  ADD COLUMN "notified_full_at" TIMESTAMPTZ,
  ADD COLUMN "notified_streak_day" TEXT;

ALTER TABLE "players"
  ADD CONSTRAINT "players_streak_count_check" CHECK ("streak_count" >= 0),
  ADD CONSTRAINT "players_not_own_referrer_check" CHECK ("referred_by" <> "id");

CREATE UNIQUE INDEX "players_referral_code_key" ON "players"("referral_code");
CREATE INDEX "players_referred_by_idx" ON "players"("referred_by");

ALTER TABLE "players" ADD CONSTRAINT "players_referred_by_fkey"
  FOREIGN KEY ("referred_by") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Limite de débit
-- ---------------------------------------------------------------------------

CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL,
    "window_start" TIMESTAMPTZ NOT NULL,
    "hits" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key", "window_start")
);

CREATE INDEX "rate_limits_window_start_idx" ON "rate_limits"("window_start");

-- ---------------------------------------------------------------------------
-- Abonnements aux notifications
-- ---------------------------------------------------------------------------

CREATE TABLE "push_subscriptions" (
    "id" BIGSERIAL NOT NULL,
    "player_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX "push_subscriptions_player_id_idx" ON "push_subscriptions"("player_id");

ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ---------------------------------------------------------------------------
-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
-- ---------------------------------------------------------------------------

ALTER TABLE "rate_limits" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "push_subscriptions" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "rate_limits", "push_subscriptions" FROM anon, authenticated;
REVOKE ALL ON SEQUENCE "push_subscriptions_id_seq" FROM anon, authenticated;
