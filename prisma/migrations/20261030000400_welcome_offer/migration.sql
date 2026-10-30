-- Offre de bienvenue : une seule fois par compte, garanti par la base.
CREATE UNIQUE INDEX "ingot_purchases_welcome_key" ON "ingot_purchases"("player_id")
  WHERE "pack_id" = 'welcome';
