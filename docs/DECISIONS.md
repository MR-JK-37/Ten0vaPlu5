# Decisions

Running log of non-obvious choices and why, newest first.

## Discount stacking: non-stackable, best single saving wins
Per §7, discounts apply before tax. `compute_invoice_totals` picks the single eligible,
applicable discount with the highest absolute saving and ignores the rest. This is simpler
to reason about for a hackathon timeline and matches the spec's explicit note to document
the choice. Revisit only if a future requirement needs stacking.

## Billing engine as a single Postgres function (`run_billing`)
`supabase/migrations/20260101000013_billing_engine.sql`. Runs the whole catch-up loop in one
transaction per subscription with `FOR UPDATE SKIP LOCKED`, so two concurrent runs never
double-bill (`UNIQUE(subscription_id, period_start)` + `ON CONFLICT DO NOTHING` is the actual
guarantee; the lock just avoids wasted work). Verified empirically: a subscription 65 days
overdue on a monthly plan produces exactly 3 invoices, and running billing twice produces no
duplicates (see session notes / `tests/unit` once billing tests land).

## Monthly/yearly period advancement clamps instead of overflowing
`advance_period()` in the same migration. Postgres `date + interval '1 month'` on Jan 31
overflows to Mar 2/3; we instead clamp to the last valid day of the target month/year so a
subscription anchored on the 31st bills on the 28th/29th/30th in short months, forever,
rather than drifting.

## RLS helper functions are `security definer`
`is_admin()`, `is_staff_or_admin()`, `current_role_name()` run as definer so they can read
`profiles` even when the calling role's own RLS would otherwise block the read inside a
policy expression. This is the standard Supabase pattern for role-lookup helpers.

## Local dev stack: Supabase CLI + Docker, not a hosted project yet
No Supabase project has been provisioned yet (would need real credentials from the user).
All schema work is developed and verified against the local Supabase stack
(`supabase start`, Postgres on 127.0.0.1:54322). Provisioning a hosted project for the
deployed demo is tracked in `docs/BLOCKERS.md`.
