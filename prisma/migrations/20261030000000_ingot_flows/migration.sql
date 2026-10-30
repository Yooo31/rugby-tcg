-- Lingots gagnés et dépensés par jour (heure de Paris), agrégats anonymes.
CREATE TABLE "ingot_flows" (
    "day" TEXT NOT NULL,
    "earned" INTEGER NOT NULL DEFAULT 0,
    "spent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ingot_flows_pkey" PRIMARY KEY ("day"),
    CONSTRAINT "ingot_flows_earned_check" CHECK ("earned" >= 0),
    CONSTRAINT "ingot_flows_spent_check" CHECK ("spent" >= 0)
);

-- Sécurité au niveau des lignes : activée, sans règle (voir CLAUDE.md).
ALTER TABLE "ingot_flows" ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON "ingot_flows" FROM anon, authenticated;
