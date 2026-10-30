-- Tâche planifiée des notifications, dans Supabase (pg_cron + pg_net).
-- GitHub Actions ne déclenchait la tâche qu'environ toutes les 5 heures :
-- ici, Postgres appelle le site toutes les 15 minutes.
--
-- Le secret n'est jamais écrit ici : il est lu dans le coffre de Supabase
-- (Vault) sous le nom `cron_secret`, à créer une fois dans l'éditeur SQL :
--   select vault.create_secret('<valeur de CRON_SECRET>', 'cron_secret');
-- (la même valeur que la variable CRON_SECRET de Vercel).
--
-- Rejouable : la tâche est remplacée si elle existe déjà.
-- À lancer avec : pnpm exec prisma db execute --file supabase/cron/notifications.sql

CREATE EXTENSION IF NOT EXISTS pg_cron;
-- Hors du schéma public (alerte de sécurité Supabase) ; ses fonctions restent
-- dans le schéma `net`.
DROP EXTENSION IF EXISTS pg_net;
CREATE EXTENSION pg_net WITH SCHEMA extensions;

SELECT cron.unschedule('notifications')
WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'notifications');

SELECT cron.schedule(
  'notifications',
  '*/15 * * * *',
  $$
  SELECT net.http_get(
    url := 'https://rugby-tcg.vercel.app/api/cron/notifications',
    headers := jsonb_build_object(
      'Authorization',
      'Bearer ' || (
        SELECT decrypted_secret FROM vault.decrypted_secrets
        WHERE name = 'cron_secret'
      )
    ),
    timeout_milliseconds := 60000
  );
  $$
);
