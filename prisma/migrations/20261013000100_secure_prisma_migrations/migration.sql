-- La table d'historique de Prisma vit dans le schéma `public`, que l'API de
-- données de Supabase expose. Sans cela, la clé publique pouvait la lire.
-- Prisma s'y connecte en propriétaire de la table : il n'est pas concerné.
ALTER TABLE "_prisma_migrations" ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON "_prisma_migrations" FROM anon, authenticated;
