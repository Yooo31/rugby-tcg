-- Booster VIP : un toutes les 48 heures (et non plus un par jour), ouvert
-- directement. On retient l'instant de la dernière ouverture.
ALTER TABLE "players" ADD COLUMN "vip_booster_at" TIMESTAMPTZ;
-- Le jour déjà pris compte comme une ouverture à minuit (heure de Paris).
UPDATE "players"
SET "vip_booster_at" = ("vip_booster_day"::date)::timestamp AT TIME ZONE 'Europe/Paris'
WHERE "vip_booster_day" IS NOT NULL;
ALTER TABLE "players" DROP COLUMN "vip_booster_day";

-- Les ouvertures de boosters VIP sont consignées comme les autres.
ALTER TABLE "booster_openings" DROP CONSTRAINT "booster_openings_source_check";
ALTER TABLE "booster_openings" ADD CONSTRAINT "booster_openings_source_check"
  CHECK ("source" IN ('free', 'bonus', 'vip'));
