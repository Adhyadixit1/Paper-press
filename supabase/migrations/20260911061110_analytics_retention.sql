-- Runs in Supabase Postgres; no external endpoint or service key in cron text.
create extension if not exists pg_cron;
select cron.schedule('paper-press-analytics-retention','30 2 * * *',
 $$delete from public.visitor_sessions where started_at < now() - interval '90 days'$$);
-- analytics_events are deleted by the session FK cascade.
