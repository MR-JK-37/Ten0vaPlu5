# Decisions

Running log of non-obvious choices and why, newest first.

## One-time git history rewrite to strip AI attribution trailers (A10.0)
Author/committer identity on every existing commit was already the repo owner
(`Ten0vaP!us <jaikiranjaikiran37@gmail.com>`, confirmed via `gh auth status` as GitHub
account `MR-JK-37`) — never an AI identity. The only thing causing `claude` to appear as a
GitHub contributor was a `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` trailer
in 7 of the 8 existing commit messages. Fix: pushed a backup branch
(`backup/pre-attribution-cleanup`, holds the original history, safe to delete once
confirmed), used `git filter-branch --msg-filter` to strip only those trailer lines
(content, author, committer, and dates all unchanged — verified with
`git diff <backup>..HEAD --stat` returning empty), then
`git push --force-with-lease origin master`. Verified afterward via
`gh api repos/MR-JK-37/Ten0vaPLu5/contributors` and the commits API that only `MR-JK-37`
remains and no commit message contains AI attribution. Going forward: `.claude/settings.json`
sets `attribution.commit`/`attribution.pr` to empty strings, `.githooks/commit-msg` rejects
any commit message matching AI-attribution patterns, and `.github/workflows/ci.yml`'s
`identity-check` job re-checks both the message pattern and the author/committer identity on
every push/PR.

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
