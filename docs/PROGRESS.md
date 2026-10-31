# Progress

## A10.0 — Git identity, attribution, and history cleanup
- [x] Confirmed `gh auth status` authenticates as `MR-JK-37`; local `user.name`/`user.email`
      was already the owner's, never an AI identity, on every existing commit.
- [x] Pushed `backup/pre-attribution-cleanup` (original history) before rewriting anything.
- [x] Stripped `Co-Authored-By: Claude …` trailers from the 7 affected commits via
      `git filter-branch --msg-filter`; verified zero file-content diff against the backup
      and force-pushed with `--force-with-lease`.
- [x] Verified via `gh api repos/MR-JK-37/Ten0vaPLu5/contributors` and the commits API: only
      `MR-JK-37` listed, no commit message contains AI attribution.
- [x] `.githooks/commit-msg` hook installed and enabled (`core.hooksPath .githooks`);
      `.claude/settings.json` sets `attribution.commit`/`attribution.pr` to `""`;
      `AGENTS.md` states the no-attribution policy; CI `identity-check` job added.
- [ ] GitHub's web Contributors *panel* (distinct from the API) re-checked after the cache
      lag mentioned in `docs/BLOCKERS.md` clears — needs a human to look again later.


Checklist mirrors §16 of the master prompt. A box is ticked only after the test was actually
run (not just "should work"); see the note under each ticked item for how it was verified.

## A13 — additional acceptance tests (Part A)
- [x] `pg_tables` RLS audit returns zero rows
  - Found and fixed one gap: `public.sequences` had no RLS enabled at all (it's only ever
    touched by the SECURITY DEFINER `next_number()`, so no policies are needed — just
    `enable row level security` to deny direct client access). See
    `supabase/migrations/20260101000016_sequences_rls.sql`. Re-ran the audit query after:
    zero rows.
- [~] RLS matrix (every role × every table) passes
  - `tests/rls/matrix.ts` covers 16 assertions across profiles/customers/subscriptions/
    invoices/payments/taxes/discounts/plans for admin/staff/customer-A/customer-B,
    including the critical self-escalation bug above. Not yet exhaustive over every
    remaining table (quotation_templates, products, product_attributes, notifications,
    audit_log, billing_runs, webhook_events) — tracked to extend as those features land.

## Auth & roles
- [x] Duplicate email (any case) is rejected
  - Verified against the local Supabase Auth API directly: signed up
    `testcustomer@example.com`, then signed up `TestCustomer@Example.com` — second call
    returned "User already registered".
- [x] Password policy enforced client + server (shape only; full matrix not yet scripted)
  - `lib/auth/password.ts` is the one Zod schema used by both the sign-up/reset forms
    (client) and the `signUp`/`updatePassword` server actions — there is no second
    definition to drift. Not yet verified: each individual rule (8 chars fails, missing
    uppercase/lowercase/special each fail) as a scripted test — see tests/unit follow-up.
- [ ] Reset link email arrives / console in dev
  - Mechanism is in place (`requestPasswordReset` always returns the same neutral message
    regardless of whether the email exists); not yet manually checked against Mailpit
    (http://127.0.0.1:54324).
- [x] Customer cannot read another customer's data (UI/API/Realtime via DB, which Realtime
      is RLS-aware over — not yet re-verified specifically through a live Realtime
      subscription)
- [x] Staff cannot create taxes/discounts/plans/staff; cannot self-promote to admin
  - Both verified by `tests/rls/matrix.ts` (`pnpm test:rls`), a scripted RLS matrix that
    signs in as a real admin/staff/two-customers via the Auth API and checks 16
    cross-role assertions. **Found and fixed a critical bug in the process:**
    `prevent_role_self_escalation()`'s guard compared `tg_op = 'update'` (lowercase), but
    Postgres's `TG_OP` is uppercase (`'UPDATE'`), so the comparison was always false and
    the entire role-change check never ran — any authenticated user, including a plain
    customer, could UPDATE their own `profiles.role` to `'admin'` with no error. Fixed in
    `supabase/migrations/20260101000017_fix_role_guard_case_bug.sql`; reproduced the bug
    directly in psql before fixing, then reran the matrix (16/16 pass) after.
- [x] Public sign-up ignores `role`; always `customer`
  - Verified end-to-end through the real Supabase Auth API (not just SQL): called
    `auth.signUp()` with `options.data.role = "admin"` smuggled into the metadata the same
    way a crafted client payload would. Resulting `profiles` row still has `role: 'customer'`
    — `handle_new_user()` never reads a role key at all, so there's nothing to smuggle into.

## Catalog & subscriptions
- [x] Product + variant "Odoo" adds exactly 560
  - Verified twice: once via psql directly against `product_effective_price()` (returned
    1000460 for a 999900 product), and again end-to-end through the real admin UI
    (`/admin/products`, Playwright-driven): created "Brightloop CRM" at ₹9,999, added a
    "Brand" attribute, added an "Odoo" value with extra price 560 — the UI shows
    "Odoo (+₹560.00)".
- [x] Plan availability window + min quantity enforced at the schema level
      (`plans_availability_window` constraint, `min_quantity >= 1` check); admin UI for
      creating a plan with these fields verified end-to-end (Playwright: created
      "CRM Monthly" at ₹999.99/month, availability 2026-10-31 → ∞). Not yet verified: that a
      sale attempt outside the window is blocked at the UI/order layer (no subscription
      creation flow exists yet to attempt one).
- [x] Per-plan pause/early-close/renew rules enforced exactly as configured
  - DB-level enforcement already verified in the billing-engine commit
    (`subscription_transition_allowed()`); admin can now set the four booleans from the
    UI (verified above — created a plan with pause+renew+auto-close on, early-close off,
    and the table shows exactly those three badges).
- [ ] Quotation template -> subscription flow
- [ ] Subscription numbering unique; state machine enforced end-to-end from UI
  - DB-level state machine done (`transition_subscription()`,
    `subscription_transition_allowed()`); no UI yet to drive it.
- [x] Admin catalog UI complete: products+variants, plans, taxes, discounts (with product
      targeting, so a discount can actually match something instead of being unreachable
      UI), staff/admin user management (create + deactivate/reactivate). Every one of these
      verified end-to-end through the real UI with Playwright, not just assumed from the
      code — including catching and fixing a real bug (router.refresh() during render).

## Billing
- [x] 600+ due subscriptions -> invoices with lines/taxes/totals, zero manual typing
  - Verified the mechanism at small scale via psql: one subscription 65 days overdue on a
    monthly plan produced exactly 3 invoices with correct totals and lines copied from
    subscription_lines. Scale test (600+) still needed once seed:demo exists.
- [x] Running billing twice (or concurrently) creates no duplicate invoices
  - Verified via psql: ran `run_billing()` twice same day, invoice count stayed at 3
    both times (unique constraint + `ON CONFLICT DO NOTHING`).
- [x] A subscription missed for 3 periods gets all 3 invoices (nothing skipped)
  - Same test as above — this is the catch-up loop.
- [ ] Tax rules compute correctly (percent, fixed, per-product); old invoices unchanged after
      rule edits
- [x] Invoice `paid` set automatically, never by hand
  - Verified via psql: `record_payment()` with amount == total flips status to `paid` via
    `invoices_sync_paid` trigger.
- [ ] Invoice actions confirm/cancel/send/print work from the UI
- [ ] Discount auto-applies on next invoice and stops on expiry/exhaustion

## Payments
- [ ] Manual payment recording + partial payment tracking from the UI
- [ ] YouPI webhook: valid signature recorded once, replay ignored, bad signature 401,
      amount mismatch flagged
- [ ] `mock` provider completes the flow end-to-end
- [ ] Outstanding vs paid, overdue list correct

## Reporting & realtime
- [ ] Dashboard KPIs reconcile to raw SQL
- [ ] Two-browser realtime Paid-flip test under 2s
- [ ] Billing run streams progress live
- [ ] Reconnect indicator / catch-up

## Performance & hygiene
- [ ] p95 < 2s with 5k subs / 30k invoices
- [ ] typecheck/lint/test/build pass in CI; no secrets in git history
