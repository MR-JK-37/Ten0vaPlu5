-- A7 requires `select * from pg_tables where schemaname='public' and rowsecurity=false`
-- to return zero rows. `sequences` was missed: it's an internal numbering counter touched
-- only by next_number(), a SECURITY DEFINER function owned by postgres (which bypasses RLS
-- as the table owner), so no client should ever read or write it directly. Enable RLS with
-- no policies at all, which denies every direct client access and leaves next_number()
-- unaffected.
alter table public.sequences enable row level security;
