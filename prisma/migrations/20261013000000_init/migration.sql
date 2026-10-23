-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "clubs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'senior-men',
    "color_primary" TEXT NOT NULL,
    "color_secondary" TEXT NOT NULL,
    "recent_results" TEXT[],
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "clubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "players" (
    "id" UUID NOT NULL,
    "ingots" INTEGER NOT NULL DEFAULT 0,
    "bonus_boosters" INTEGER NOT NULL DEFAULT 0,
    "reserve_count" INTEGER,
    "reserve_since" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "owned_cards" (
    "player_id" UUID NOT NULL,
    "club_id" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "first_obtained_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "owned_cards_pkey" PRIMARY KEY ("player_id","club_id","rarity")
);

-- CreateTable
CREATE TABLE "mission_logs" (
    "player_id" UUID NOT NULL,
    "day" TEXT NOT NULL,
    "progress" JSONB NOT NULL DEFAULT '{}',
    "claimed" TEXT[],

    CONSTRAINT "mission_logs_pkey" PRIMARY KEY ("player_id")
);

-- CreateTable
CREATE TABLE "claimed_albums" (
    "player_id" UUID NOT NULL,
    "album_id" TEXT NOT NULL,
    "claimed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "claimed_albums_pkey" PRIMARY KEY ("player_id","album_id")
);

-- CreateIndex
CREATE INDEX "owned_cards_club_id_idx" ON "owned_cards"("club_id");

-- AddForeignKey
ALTER TABLE "owned_cards" ADD CONSTRAINT "owned_cards_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "owned_cards" ADD CONSTRAINT "owned_cards_club_id_fkey" FOREIGN KEY ("club_id") REFERENCES "clubs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mission_logs" ADD CONSTRAINT "mission_logs_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "claimed_albums" ADD CONSTRAINT "claimed_albums_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ---------------------------------------------------------------------------
-- Compléments écrits à la main (hors du périmètre de Prisma).
-- ---------------------------------------------------------------------------

-- Un joueur est un utilisateur Supabase : sa ligne disparaît avec son compte.
ALTER TABLE "players"
  ADD CONSTRAINT "players_id_fkey"
  FOREIGN KEY ("id") REFERENCES auth.users ("id") ON DELETE CASCADE;

-- Garde-fous : la base refuse un état incohérent même si le code se trompe.
ALTER TABLE "players"
  ADD CONSTRAINT "players_ingots_check" CHECK ("ingots" >= 0),
  ADD CONSTRAINT "players_bonus_boosters_check" CHECK ("bonus_boosters" >= 0),
  ADD CONSTRAINT "players_reserve_count_check" CHECK ("reserve_count" >= 0),
  ADD CONSTRAINT "players_reserve_pair_check"
    CHECK (("reserve_count" IS NULL) = ("reserve_since" IS NULL));

ALTER TABLE "owned_cards"
  ADD CONSTRAINT "owned_cards_count_check" CHECK ("count" >= 1);

-- Sécurité au niveau des lignes : activée partout, sans aucune règle d'accès.
-- L'API de données de Supabase (clé publique) ne peut donc rien lire ni écrire.
-- L'application passe par Prisma côté serveur, qui contrôle elle-même l'accès
-- à partir de la session (voir CLAUDE.md).
ALTER TABLE "clubs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "owned_cards" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "mission_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "claimed_albums" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "clubs", "players", "owned_cards", "mission_logs", "claimed_albums"
  FROM anon, authenticated;
