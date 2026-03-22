-- ============================================================
-- Campaign Orchestrator: pg_cron Setup
-- Run this in the MAIN Supabase project (nssvviukveinrpwicyfw)
-- ============================================================

-- Step 1: Enable required extensions
-- (Also toggle pg_cron and pg_net ON in Dashboard -> Database -> Extensions)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Step 2: Add the campaign_orchestrator_webhook_url column (if not already added)
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS campaign_orchestrator_webhook_url TEXT;

-- Step 3: Schedule the campaign-tick edge function to run every minute
-- URL and service key are hardcoded (ALTER DATABASE SET is not allowed on managed Supabase)
SELECT cron.schedule(
  'campaign-tick',           -- job name
  '* * * * *',               -- every minute
  $$
  SELECT net.http_post(
    url := 'https://nssvviukveinrpwicyfw.supabase.co/functions/v1/campaign-tick',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zc3Z2aXVrdmVpbnJwd2ljeWZ3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAxOTMxMiwiZXhwIjoyMDg3NTk1MzEyfQ.S8Skm40sTPVSirK76bfJV7H9gN108SnKggTXQOanA7Q"}'::jsonb,
    body := '{"tick": true}'::jsonb
  );
  $$
);

-- To check existing cron jobs:
-- SELECT * FROM cron.job;
--
-- To remove the job:
-- SELECT cron.unschedule('campaign-tick');
