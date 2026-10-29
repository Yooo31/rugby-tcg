-- Passe de saison : saisons programmées, avancement des joueurs, voies payantes.
-- Écrite à la main (voir 20261022000000_players_social_admin).

CREATE TABLE "seasons" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ NOT NULL,
    "ends_at" TIMESTAMPTZ NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seasons_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "seasons_period_check" CHECK ("ends_at" > "starts_at")
);

CREATE INDEX "seasons_starts_at_ends_at_idx" ON "seasons"("starts_at", "ends_at");

CREATE TABLE "season_logs" (
    "player_id" UUID NOT NULL,
    "season_id" TEXT NOT NULL,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "claimed_free" INTEGER[],
    "claimed_premium" INTEGER[],
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "season_logs_pkey" PRIMARY KEY ("player_id"),
    CONSTRAINT "season_logs_xp_check" CHECK ("xp" >= 0)
);

ALTER TABLE "season_logs" ADD CONSTRAINT "season_logs_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "season_passes" (
    "player_id" UUID NOT NULL,
    "season_id" UUID NOT NULL,
    "granted_by" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "season_passes_pkey" PRIMARY KEY ("player_id", "season_id")
);

CREATE INDEX "season_passes_season_id_idx" ON "season_passes"("season_id");

ALTER TABLE "season_passes" ADD CONSTRAINT "season_passes_player_id_fkey"
  FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "season_passes" ADD CONSTRAINT "season_passes_season_id_fkey"
  FOREIGN KEY ("season_id") REFERENCES "seasons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
ALTER TABLE "seasons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "season_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "season_passes" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "seasons", "season_logs", "season_passes" FROM anon, authenticated;
