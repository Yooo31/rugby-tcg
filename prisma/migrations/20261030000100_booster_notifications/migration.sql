-- Notifications : chaque booster regagné (et non plus seulement la réserve
-- pleine), et rappel du soir des boosters non ouverts.
ALTER TABLE "players" RENAME COLUMN "notified_full_at" TO "notified_booster_at";
ALTER TABLE "players" ADD COLUMN "notified_evening_day" TEXT;
