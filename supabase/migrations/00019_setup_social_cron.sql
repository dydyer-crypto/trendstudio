-- Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Setup the cron job to run every 5 minutes
-- Note: Replace 'your-project-ref' with your actual Supabase project reference
-- Replace 'YOUR_SERVICE_ROLE_KEY' with your actual service role key (found in Project Settings > API)

SELECT cron.schedule(
  'process-scheduled-posts-every-5-mins', -- name of the cron job
  '*/5 * * * *',                          -- every 5 minutes
  $$
  SELECT
    net.http_post(
      url := 'https://hqzjashvnnmykzernvkz.supabase.co/functions/v1/process_scheduled_posts',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || 'YOUR_SERVICE_ROLE_KEY'
      ),
      body := '{}'
    );
  $$
);

-- Note: In a production environment, it is better to store the SERVICE_ROLE_KEY 
-- in a vault and retrieve it dynamically, but this template provides the base structure.
