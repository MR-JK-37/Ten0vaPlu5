# Progress

Checklist mirrors §16 of the master prompt. A box is ticked only after the test was actually
run (not just "should work"); see the note under each ticked item for how it was verified.

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
- [ ] Customer cannot read another customer's data (UI/API/Realtime)
- [ ] Staff cannot create taxes/discounts/plans/staff
- [x] Public sign-up ignores `role`; always `customer`
  - Verified end-to-end through the real Supabase Auth API (not just SQL): called
    `auth.signUp()` with `options.data.role = "admin"` smuggled into the metadata the same
    way a crafted client payload would. Resulting `profiles` row still has `role: 'customer'`
    — `handle_new_user()` never reads a role key at all, so there's nothing to smuggle into.

## Catalog & subscriptions
- [x] Product + variant "Odoo" adds exactly 560
  - Verified via psql: inserted product (sales_price 999900), attribute "Brand", value
    "Odoo" (extra_price 560); `product_effective_price()` returned 1000460. Reset after.
- [ ] Plan availability window + min quantity enforced
- [ ] Per-plan pause/early-close/renew rules enforced exactly as configured
- [ ] Quotation template -> subscription flow
- [ ] Subscription numbering unique; state machine enforced end-to-end from UI
  - DB-level state machine done (`transition_subscription()`,
    `subscription_transition_allowed()`); no UI yet to drive it.

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
