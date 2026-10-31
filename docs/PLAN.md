

<pasted_content id="4d88">
# MASTER PROMPT — Subscription Management System (Brightloop Software)

> Paste this whole file into your coding agent (Antigravity / Claude Code / Cursor). It is self-contained.
> Repo to commit into: https://github.com/MR-JK-37/Ten0vaPLu5 (branch `master`, currently contains only `Subscription_Management_System.pdf` — keep that file).

---

## 0. ROLE AND OPERATING RULES

You are a senior full-stack engineer and billing-domain expert building a **complete, working, real-time Subscription Management System** for a hackathon. Time is short, so you work autonomously, in small verified steps, and you never stop to ask unless a decision is irreversible.

Rules you must follow every time:

1. **Never guess an API.** Before using Next.js, Supabase, shadcn/ui, TanStack, Zod, Recharts, Resend or any library, check its *current* docs for the installed version. If a doc contradicts this prompt, the docs win; note it in `docs/DECISIONS.md`.
2. **Verify before you commit.** After every feature run: `pnpm typecheck && pnpm lint && pnpm test && pnpm build`. Commit only when green.
3. **Commit everything to the repo** (see §14). Small commits, pushed after each one. The repo is **PUBLIC**: never commit `.env*`, service-role keys, webhook secrets, real customer data or real UPI IDs. Only `.env.example` with placeholders.
4. **Blocked on a credential or external service?** Do not stop. Use the `mock` provider / console email, log it in `docs/BLOCKERS.md`, keep building.
5. **No fake features.** Every button in the UI must do something real against the database. No hard-coded demo numbers on dashboards. If something is not built, remove the button.
6. **Money is integers.** All amounts are stored as integer minor units (paise/cents) in `bigint`. Never use floats for money. One shared `money.ts` for formatting and rounding (half-up).
7. **Server is the authority.** Every rule (roles, password policy, tax, discount, state transitions, billing) is enforced on the server and in the database. The UI only reflects it.
8. Keep a running `docs/PROGRESS.md` with a checklist of §16 acceptance tests, ticked only when you have actually run the test.

---

## 1. THE PRODUCT (from the problem statement PDF — treat as the spec)

**Goal:** one unified platform that runs the full life of a subscription business: products → plans → quotations → subscriptions → recurring invoices → payments → revenue reporting.

**Company:** Brightloop Software sells software by subscription (monthly/yearly), add-ons customers switch on/off, and products with variants. Customers: small shops (monthly) to large companies (yearly).

**Pain points to eliminate:** subscriptions in spreadsheets, renewals missed, invoices typed by hand, payments matched by scrolling bank statements, revenue reports built manually each quarter. "Nobody can say how much recurring revenue the company has."

**Non-functional requirement:** with thousands of subscriptions, **every page responds in under 2 seconds**.

**Extra requirement from the user:** *every feature must work in real time* (see §8), and payments use the **YouPI-PG** gateway (see §9).

---

## 2. ROLES AND ACCESS (RBAC) — three roles

| Capability | Admin | Staff (internal) | Customer |
|---|---|---|---|
| Sign up publicly | No (seeded) | **No** — only Admin creates | **Yes** (self sign-up, always `customer`) |
| Create / edit / deactivate **staff accounts** | **Yes (only)** | No | No |
| Products, variants, **plans** (create/edit/close rules) | **Yes** | Read-only | Read active plans only |
| **Tax rules** | **Yes (only)** | Read-only | No |
| **Discount rules** | **Yes (only)** | Read-only (can see which apply) | No |
| Quotation templates | Yes | Create/use | No |
| Customers (CRM records) | Yes | Create/edit | Own profile only |
| Subscriptions | All | Create, move through states, view all | **Own only**; accept quotation, pause/close/renew **if the plan allows**, toggle add-ons |
| Invoices | All + cancel | Confirm, cancel, send, print | **Own only**, view/print/pay |
| Payments | All | Record, view | Own only (via online pay); view own |
| Reports / dashboard | Full | Full except admin settings | Own spending summary only |
| Audit log | Yes | Own actions | No |

Enforcement (all three layers mandatory):
- **Database:** `profiles.role` enum (`admin|staff|customer`) + Postgres **Row Level Security** on every table. Customers can only `SELECT` rows where `customer_id = their customer`. A trigger blocks any non-admin from changing `role`.
- **Server:** route handlers/server actions call `requireRole([...])`; the service-role key is used **only** in server code and only for admin-created staff and webhooks.
- **UI:** menus/buttons hidden per role, but never trusted.
- Public sign-up endpoint **ignores any `role` field** and always creates `customer`.
- Seed one admin from env (`SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`) via `pnpm seed:admin`.

---

## 3. AUTHENTICATION RULES (exact)

- Sign up with **email + password**. **One account per email** (case-insensitive unique; normalise to lower-case).
- Password policy: **more than eight characters (i.e. minimum 9)**, at least **one uppercase**, **one lowercase**, **one special character**. Enforce in Zod on client **and** server route (do not rely on the provider's default rules). Show a live strength checklist.
- **Forgot password:** email a reset link to the registered email → `/reset-password` page with the same policy. Neutral message whether or not the email exists (no account enumeration).
- Email delivery: configure **custom SMTP (Resend free tier or Brevo)** because the auth provider's built-in mailer has a very low rate limit. In local dev, log links to the console.
- Login rate-limit and generic error messages. Sessions via secure httpOnly cookies. Role-based redirect after login (`/admin`, `/staff`, `/portal`).

---

## 4. RECOMMENDED STACK (all free-tier friendly)

| Layer | Choice | Why |
|---|---|---|
| App | **Next.js (App Router) + TypeScript (strict)** | one codebase, server actions, fast |
| UI | Tailwind + **shadcn/ui**, TanStack Table, Recharts, react-hook-form + Zod | quick, polished, accessible |
| DB / Auth / Realtime | **Supabase** (Postgres, Auth, RLS, Realtime `postgres_changes`, `pg_cron`) | RBAC via RLS + built-in realtime with zero extra infra |
| Business logic | **Postgres functions (RPC)** for billing run, invoice generation, payment recording | atomic, idempotent, fast |
| Email | Resend (free ≈100/day) via SMTP/API | reset + invoice emails |
| PDF/print | `@react-pdf/renderer` or print-CSS page | "print any invoice" |
| Payments | **YouPI-PG** behind a provider interface + `manual` + `mock` | see §9 |
| Tests | Vitest (unit), SQL/pgTAP or script tests (RLS), Playwright (e2e + two-browser realtime), k6 or autocannon (perf) | prove the 2-second claim |
| CI | GitHub Actions (free): typecheck, lint, test, build; **also** a scheduled workflow that pings the billing-run endpoint as a backup to `pg_cron` |

If Supabase is unavailable, fallback: Neon Postgres + Auth.js + Postgres `LISTEN/NOTIFY` → Server-Sent Events (works on a direct TCP connection, **not** through a transaction pooler). Decide once and record in `docs/DECISIONS.md`.

Folder layout: `app/(public)`, `app/(auth)`, `app/admin`, `app/staff` (or one `app/(dashboard)` with role-gated routes), `app/portal`, `app/api/webhooks/youpi`, `lib/{money,tax,discount,billing,rbac,payments}`, `supabase/migrations`, `supabase/seed`, `tests/{unit,rls,e2e,perf}`, `docs/`.

---

## 5. DOMAIN MODEL (implement as SQL migrations, all with RLS, indexes, `created_at/updated_at`)

**profiles** `(id = auth.users.id, email unique lower, full_name, role, is_active)`
**customers** `(id, profile_id nullable, name, email, phone, company, billing_address, tax_id, notes)` — a customer user maps to exactly one customer.

**products** `(id, name, type enum[service|software|addon|physical], sales_price, cost_price, notes, is_active)`
**product_attributes** `(id, product_id, name e.g. "Brand")` · **product_variant_values** `(id, attribute_id, value e.g. "Odoo", extra_price e.g. 560)`
→ Effective unit price = `sales_price + sum(selected variant extra_price)`. **Example that must work: choosing brand "Odoo" adds 560 to the price.**

**plans** `(id, name, product scope, price, billing_period enum[daily|weekly|monthly|yearly], min_quantity, available_from, available_to, auto_close_on_end bool, allow_early_close bool, allow_pause bool, allow_renew bool, is_active)`
→ The **four booleans are set per plan by the admin** ("the admin decides which, plan by plan"). A plan cannot be sold outside `available_from..available_to`. If `auto_close_on_end`, a job closes it when `available_to` passes.

**quotation_templates** `(id, name, plan_id, validity_days, notes)` + **quotation_template_lines** `(product_id, variant_value_ids, quantity)`

**subscriptions** `(id, number unique "SUB-2026-00001", customer_id, plan_id, status enum[draft|quotation|confirmed|active|paused|closed], start_date, expiry_date, payment_terms (e.g. due in N days), next_billing_date, quote_valid_until, template_id, closed_reason, created_by)`
**subscription_lines** `(subscription_id, product_id, variant_value_ids, quantity, unit_price, tax_ids, amount)`

**taxes** `(id, name, type percent|fixed, rate, applies_to all|product, product_ids, is_active, valid_from, valid_to)` — optional GST split (CGST+SGST / IGST) via two child rates.
**discounts** `(id, name, kind fixed|percent, value, min_purchase, min_quantity, valid_from, valid_to, usage_limit, times_used, applies_to products|subscriptions, product_ids, subscription_ids, is_active)`

**invoices** `(id, number unique "INV-2026-000001", subscription_id, customer_id, period_start, period_end, issue_date, due_date, status enum[draft|confirmed|paid|cancelled], subtotal, discount_total, tax_total, total, amount_paid, amount_due (generated), sent_at)`
**invoice_lines** `(invoice_id, product_id, description, quantity, unit_price, discount_amount, tax_amount, amount)`
**UNIQUE `(subscription_id, period_start)` on invoices (non-cancelled)** — this constraint is the "nothing billed twice" guarantee.

**payments** `(id, invoice_id, method enum[cash|bank_transfer|cheque|card|upi|youpi|other], amount, paid_on, note, reference (UTR/txn id), provider, provider_payment_id, status enum[pending|confirmed|failed|refunded], verification_level, recorded_by)`
**payment_attempts / webhook_events** `(delivery_id unique, provider, payload, signature_ok, processed_at)` — idempotent webhook processing.
**billing_runs** `(id, started_at, finished_at, as_of, status, due_count, created_count, skipped_count, error_count)` + **billing_run_items** — drives a live progress bar.
**notifications** `(user_id/role, type, title, body, link, read_at)` — drives toasts and the bell.
**audit_log** `(actor, action, entity, entity_id, before, after, at)` — written by triggers.
**sequences** for numbering (gaps allowed, duplicates not).

Indexes (required for <2 s): `subscriptions(status, next_billing_date)`, `subscriptions(customer_id)`, `invoices(status, due_date)`, `invoices(customer_id, created_at desc)`, `invoices(subscription_id, period_start)` unique, `payments(invoice_id)`, `payments(paid_on)`. Use **keyset pagination**, never `OFFSET` on big tables.

---

## 6. STATE MACHINES (enforce in DB functions; reject illegal transitions)

**Subscription:** `draft → quotation → confirmed → active → closed`
- `quotation`: sent to customer, valid for `validity_days`; auto-closes with reason `quote_expired` after `quote_valid_until`.
- `confirmed → active`: automatically on `start_date` (job) or manual "Activate".
- `active ⇄ paused` only if `plan.allow_pause`; `active → closed` early only if `plan.allow_early_close`; **renew** (new term, new expiry, continues billing) only if `plan.allow_renew`.
- Reaching `expiry_date` → `closed` automatically (or renewed if auto-renew is set).
- Everyone on the team sees the current stage as a status badge and a timeline (who/when).

**Invoice:** `draft → confirmed → paid`, plus `cancelled` from draft/confirmed (if unpaid). Actions: **confirm, cancel, send (email+PDF), print**. `paid` is set **automatically** when `amount_paid >= total` (never by hand). Overdue = `confirmed` and `due_date < today` and `amount_due > 0` (derived, plus a nightly notification).

---

## 7. BILLING ENGINE (the heart — get this exactly right)

Implement as a single Postgres function `run_billing(as_of date, dry_run bool)` plus a "Run billing now" admin button and a `pg_cron` schedule (daily) with a GitHub Actions backup trigger.

Algorithm:
1. Select `active` subscriptions with `next_billing_date <= as_of` using `FOR UPDATE SKIP LOCKED` (safe if two runs overlap).
2. For each, in a **single transaction**: loop over every missed period until `next_billing_date > as_of` (**catch-up so nothing is skipped**). For each period:
   - Create the invoice from subscription lines: customer details, product lines, variant-adjusted unit price, quantity (≥ plan `min_quantity`), period dates, `due_date = issue_date + payment_terms`.
   - Apply **discounts** (§ below), then compute **taxes**, then totals; round per line half-up.
   - Insert with `ON CONFLICT (subscription_id, period_start) DO NOTHING` → **never billed twice**.
   - Advance `next_billing_date` by the plan period (daily +1d, weekly +7d, monthly +1 month with end-of-month clamping, yearly +1y).
   - Stop billing past `expiry_date`; close the subscription.
3. Record counts in `billing_runs`; stream progress (realtime) so the admin sees "412 / 600 invoiced".
4. New invoices are created as `draft` (admin setting: auto-confirm and auto-send optional).
5. `dry_run` returns what *would* be created (used in tests and a UI preview).

**Taxes:** admin-defined rules (percent or fixed, global or per product, validity dates). Calculated automatically on every invoice line; stored on the invoice so later rule changes never alter past invoices.

**Discounts (admin only):**
- fixed amount or percentage; minimum purchase and/or minimum quantity; start/end dates; **usage limit**.
- applies to specific products or whole subscriptions.
- Once eligible it is **auto-applied on the next invoice** with no human action, and **stops when expired or `times_used >= usage_limit`**.
- Increment `times_used` inside the invoice-creation transaction (decrement if the draft invoice is cancelled). Default: non-stackable, best single saving wins; discount is applied **before** tax. Document in `docs/DECISIONS.md`.

**Order of calculation:** line subtotal → discount → taxable base → tax → total.

---

## 8. REAL-TIME REQUIREMENTS (non-negotiable)

Use Supabase Realtime (`postgres_changes`, RLS-aware) plus Broadcast for ephemeral events. Subscribe in a small `useRealtime(table, filter)` hook that updates the TanStack Query cache and shows a subtle toast. Add auto-reconnect and a "Live" / "Reconnecting…" indicator in the header. Every list also does a catch-up refetch on reconnect.

These must visibly update **without a page refresh**, in two browser windows:
1. Subscription status changes (staff moves Draft→Quotation→…; the customer's portal badge updates instantly; customer accepts a quote → staff sees it instantly + notification).
2. New invoices appear while the billing run executes (progress bar + rows streaming in).
3. Invoice status changes (confirm/cancel/paid).
4. **Payment lands → invoice flips to Paid → dashboard KPIs, outstanding and overdue lists update live** (including when YouPI's webhook arrives).
5. Dashboard KPIs: active subscriptions, MRR/ARR, revenue collected, outstanding, overdue count — update live.
6. Notification bell + toasts for staff (payment received, overdue, quote accepted) and customers (invoice issued, payment confirmed).
7. Admin changes (plan closed, discount exhausted) reflect for staff immediately.

Free-tier limits to respect (as of the sources checked): ~200 concurrent Realtime connections and ~2M messages/month; payload ≤ ~256 KB. So: subscribe per page and per-role filter, unsubscribe on unmount, never subscribe to whole large tables from customers. Enable `REPLICA IDENTITY FULL` only on tables where UPDATE filters need old values. **Test that RLS also filters Realtime** (a customer must never receive another customer's events).

---

## 9. PAYMENTS — YouPI-PG INTEGRATION (read carefully; it has real limits)

Repo: https://github.com/youpi-pg/YouPI-PG — a **self-hosted UPI / Cash-on-Delivery gateway**, Node.js (≥22.13) + SQLite, with a checkout portal, REST API and an Android observer app that reads bank SMS to verify UPI payments. **Its README calls it experimental / research, not certified or production-ready**, INR-oriented, and says a valid webhook signature does not by itself prove bank settlement. So:

**Architecture — do not hard-wire YouPI.** Define a `PaymentProvider` interface (`createCheckout(invoice)`, `getStatus(id)`, `verifyWebhook(req)`, `normalizeEvent()`), with three implementations:
- `manual` — staff record cash / bank transfer / cheque / UPI (**this is required by the PDF**: record method, amount, date, note against the right invoice).
- `youpi` — online UPI checkout for customers.
- `mock` — instant simulated payment for demos/CI when the YouPI server or Android observer is not available.
Select with env `PAYMENT_PROVIDER`; the UI shows only enabled providers.

**YouPI flow (verify each detail against the repo's README + `openapi.yaml` before coding; the spec has gaps):**
1. Customer clicks **Pay** on an invoice → server calls `POST {YOUPI_BASE_URL}/api/v1/payments` with `orderId`, `amount` (string, 2 decimals, e.g. `"499.00"`), `currency` (`INR`), `customer{name,email,phoneNumber}`, `description`, `returnUrl`, `metadata{invoiceId}` and an **`Idempotency-Key`** header; optional `X-Merchant-Id`.
   - YouPI returns `409 ORDER_AMOUNT_MISMATCH` if an `orderId` is reused with a different amount → build `orderId` as `INV-…-<attempt>` (new attempt number whenever the amount due changes).
   - Response has `paymentId`, `status` (`INITIATED|ACTIVE|QUEUED|PROCESSING|SUCCESS|FAILED|EXPIRED|CANCELLED`), `queuePosition`, `checkoutUrl`. Redirect/modal to `checkoutUrl` (or load its `youpi.js` widget).
2. **Webhook** `POST /api/webhooks/youpi`:
   - Read the **raw body bytes** first; verify HMAC-SHA256 with `YOUPI_WEBHOOK_SECRET` using constant-time comparison. Headers documented: `X-Gateway-Signature` (`sha256=` + hex HMAC of raw body), `X-Gateway-Signature-V2` (HMAC bound to timestamp + body), `X-Gateway-Event`, `X-Gateway-Delivery-Id`, `X-Gateway-Timestamp`. Confirm the exact format in the repo source/README.
   - **Deduplicate on `deliveryId`** (insert into `webhook_events`, unique). Retries last up to ~1 hour with the original timestamp, so any freshness window must be ≥ 1 hour; do not reject retries as "stale".
   - Payload includes `event`, `orderId`, `amountPaise` (integer), `utr`, `paymentId`, `verificationLevel`. Map `orderId`→invoice, verify `amountPaise` equals the expected amount, then call the `record_payment` RPC (idempotent on `provider_payment_id`).
   - Policy: `SUCCESS` with `verificationLevel ≥ 1` → payment `confirmed` automatically; `verificationLevel = 0` → payment `pending` and a notification "needs staff verification". Respond `200` quickly; do work idempotently.
3. **Fallback polling:** while the customer waits, poll `GET /api/v1/payments/{id}` every few seconds (and on webhook miss) so the invoice still flips to Paid.
4. Cancel → `POST /api/v1/checkout/{id}/cancel`.
5. Payments update the invoice → Realtime pushes to staff dashboard and customer portal (§8).

**Hosting caveat:** YouPI needs a long-running Node server with SQLite — it **cannot run on Vercel serverless**, and free Render services sleep and have ephemeral disks. For the demo run it locally / in Docker (its repo ships a Dockerfile and docker-compose.yml) and expose it with a free **Cloudflare Tunnel**; point `YOUPI_BASE_URL` at that URL. Real UPI verification needs an Android phone with the observer APK; if that is not available, the `mock` provider must give a complete end-to-end demo. Document this in the README honestly. Test UPI payments only with small amounts and follow the repo's own testing guidance.

---

## 10. FEATURE LIST BY SCREEN (build all)

**Public:** landing, pricing (live active plans), sign-up, login, forgot/reset password.

**Admin:** dashboard · users (create/deactivate **staff**, only here) · products (+ variants with extra price) · plans (+ the four per-plan rules, availability dates) · quotation templates · tax rules · discount rules (usage counter live) · billing runs (run now, dry-run, history, live progress) · settings (numbering prefixes, default payment terms, company details, auto-confirm/send) · audit log · reports.

**Staff:** customers (CRUD) · subscriptions (create from template or scratch, lines, stage actions, timeline) · invoices (list with filters; confirm / cancel / send / print) · payments (record manually; matching UI shows outstanding invoices per customer) · overdue chase list with "send reminder" · dashboard.

**Customer portal:** my subscriptions (status, next billing date, lines; accept quote; pause / close / renew when the plan allows; **switch add-ons on/off**) · my invoices (view, print/PDF, pay online) · payment history · profile.

**Finance dashboard (Admin + Staff):** active subscriptions, **MRR/ARR** (normalise weekly=×52/12, yearly=÷12, daily=×365/12), revenue collected (by day/month), outstanding, overdue invoices with ageing buckets (1-30, 31-60, 61-90, 90+), payments list; **filters** (date range, customer, plan, product, status, payment method); **summary view** + detail tables; CSV export. All numbers come from SQL aggregates/views — never client-side sums over big lists.

**Quality bar:** responsive, dark/light, empty states, skeleton loaders, optimistic UI where safe, form validation messages, accessible labels, no console errors.

---

## 11. OPEN-SOURCE REFERENCES — take the *ideas*, never the code

Study for feature design only (check each licence; Lago is AGPL-3.0 so do **not** copy its code):

| Project | Borrow this idea |
|---|---|
| **Lago** | idempotent invoice generation, billing-period boundaries, customer portal concept, webhook delivery with retries, wallet/credit concepts (optional) |
| **Kill Bill** | explicit subscription/invoice state machines, "invoice run" that catches up missed periods, dunning/retry cadence for overdue invoices |
| **Odoo Subscriptions (concept)** | quotation templates → subscription, recurring plans, MRR/ARR/churn metrics, stage pipeline/kanban for renewals |
| **Flexprice / OpenMeter** | plan/price versioning ideas; entitlements for add-on toggles |
| **FOSSBilling** | simple client-area UX for invoices and payments |
| **YouPI-PG** | idempotency keys, signed webhooks with delivery IDs, payment status enum, integer-paise amounts |

Optional nice-to-have if time remains (in this order): dunning reminders (day +1/+7/+14 overdue), credit notes/refunds, proration on add-on toggle, kanban renewal board, multi-currency, CSV import of customers.

---

## 12. FREE RESOURCES (all verified as free tiers; re-check limits before relying on them)

- **Supabase free:** 2 projects, 500 MB DB, 1 GB files, 50k MAU, realtime ≈200 concurrent / 2M msgs. ⚠ Free projects **pause after ~1 week of inactivity** → keep a daily cron ping and wake it the day before the demo.
- **Vercel Hobby:** free hosting for Next.js (terms say personal/non-commercial — fine for a hackathon). Alternatives: Cloudflare Pages/Workers, Netlify.
- **Neon** (Postgres, scales to zero) as fallback DB. **Upstash** Redis free if a rate-limiter is needed.
- **Resend** (~100 emails/day) or **Brevo** SMTP free for emails.
- **GitHub Actions** (free for public repos) for CI and scheduled billing trigger.
- **Cloudflare Tunnel** (free) to expose the self-hosted YouPI server.
- **Sentry** free tier for errors; **UptimeRobot** free to keep services warm.
- UI/tooling: shadcn/ui, Recharts, TanStack Table/Query, Lucide icons, Playwright, k6/autocannon — all free/open source.

---

## 13. PERFORMANCE — "every page under 2 seconds"

- Seed script `pnpm seed:demo --subs 5000 --invoices 30000 --payments 20000` generating realistic fake data.
- Server-side pagination (keyset), column selection (no `select *`), indexes in §5, dashboard aggregates via SQL views / materialised summary refreshed incrementally (or a `kpi_snapshot` table updated by triggers).
- Cache static reads (plans, taxes) with revalidation; stream with Suspense and skeletons; code-split charts.
- `tests/perf`: hit every main route and RPC with 5k+ subs, assert **p95 < 2 s** and print a table into `docs/PERFORMANCE.md`. Fix anything slower before finishing.

---

## 14. GIT WORKFLOW (repo: MR-JK-37/Ten0vaPLu5, branch `master`)

1. `git clone https://github.com/MR-JK-37/Ten0vaPLu5` (keep the existing PDF; move it to `docs/spec/` with `git mv` in the first commit).
2. First commits: `chore: scaffold Next.js + tooling`, `docs: add README, PROGRESS, DECISIONS`, `chore: .gitignore and .env.example`.
3. Then one commit per vertical slice using Conventional Commits, e.g. `feat(db): subscriptions and invoices schema with RLS`, `feat(billing): idempotent run_billing with catch-up`, `feat(realtime): live invoice and KPI updates`, `feat(payments): YouPI provider and signed webhook`, `test(billing): no double billing under concurrent runs`, `perf: add indexes for dashboard queries`.
4. `git push origin master` after every green commit (hackathon pace: direct to `master` is fine). Never force-push. Never rewrite history.
5. Before each commit: secrets scan (`git diff --cached | grep -iE "secret|service_role|password|api[_-]?key"`) and confirm `.env*` is ignored.
6. Final: tag `v1.0.0`, README with architecture diagram, setup in <10 commands, env table, demo accounts (fake), screenshots/GIF, YouPI instructions, known limitations.

---

## 15. BUILD ORDER (timeboxed — finish each before the next; cut from the bottom if time runs out)

1. **Foundation:** scaffold, env, Supabase project + migrations, auth, password policy, roles + RLS, admin seed, layout shells per role. *(commit)*
2. **Catalog:** products + variants (+560 Odoo example), plans with the four rules + availability, taxes, discounts, quotation templates. *(commit)*
3. **Subscriptions:** create from template/scratch, lines, numbering, state machine, timeline, customer acceptance. *(commit)*
4. **Billing engine:** `run_billing`, invoice lines, tax + discount calc, uniqueness, catch-up, dry-run, billing run UI with live progress. *(commit)*
5. **Invoices:** confirm / cancel / send (email + PDF) / print, statuses, overdue logic. *(commit)*
6. **Payments:** manual recording + auto-Paid, provider interface, `mock`, **YouPI** provider + webhook + polling. *(commit)*
7. **Reporting:** finance dashboard, MRR/ARR, filters, summary, CSV, ageing. *(commit)*
8. **Realtime pass:** wire every §8 item, connection indicator, notifications, RLS-on-Realtime test. *(commit)*
9. **Customer portal polish:** pause/close/renew by plan rule, add-on toggles, pay online. *(commit)*
10. **Hardening:** seed 5k+ data, perf tests, e2e tests, accessibility, error pages, README, tag release. *(commit)*

Cut-line if short on time: keep 1–8 fully real; simplify 9 (add-on toggles) and optional extras.

---

## 16. ACCEPTANCE TESTS (each must pass and be ticked in `docs/PROGRESS.md`)

**Auth & roles**
- [ ] Duplicate email (any case) is rejected; second sign-up fails cleanly.
- [ ] Passwords: 8 chars fails; 9 chars without uppercase / lowercase / special each fail; valid one passes — client **and** direct API call.
- [ ] Reset link email arrives (or console in dev) and sets a new compliant password; unknown email shows neutral message.
- [ ] Customer cannot read another customer's subscriptions/invoices/payments via UI, API **or** Realtime.
- [ ] Staff cannot create taxes, discounts, plans, or other staff (UI hidden **and** server/RLS rejects).
- [ ] Only Admin can create staff; public sign-up posting `role=admin` still yields `customer`.

**Catalog & subscriptions**
- [ ] Product with name, type, sales price, cost price, notes; variant brand "Odoo" adds exactly 560.
- [ ] Plan with daily/weekly/monthly/yearly, min quantity, availability dates; sale outside the window is blocked; min quantity enforced.
- [ ] Per-plan rules: pause/early-close/renew allowed or blocked exactly as configured; auto-close on end works.
- [ ] Quotation template → subscription copies plan + lines, honours validity days, expires correctly.
- [ ] Subscription numbering unique; Draft→Quotation→Confirmed→Active→Closed enforced; illegal jumps rejected; all staff see the stage.

**Billing**
- [ ] Billing day with 600+ due subscriptions creates 600+ invoices with customer, lines, taxes, totals pre-filled; zero manual typing.
- [ ] Running billing twice (and two concurrent runs) creates **no** duplicate invoices.
- [ ] A subscription not billed for 3 periods gets all 3 invoices (nothing skipped).
- [ ] Tax rules compute correctly (percent, fixed, per-product); old invoices unchanged after rule edits.
- [ ] Invoice actions confirm / cancel / send / print work; status Draft→Confirmed→Paid; Paid only via payments.
- [ ] Discount (fixed and %, min purchase/qty, dates, usage limit; product-level and subscription-level) auto-appears on the next invoice and stops on expiry/exhaustion; only Admin can create.

**Payments**
- [ ] Manual payment records method, amount, date, note against the right invoice; partial payments tracked; invoice auto-Paid at full amount.
- [ ] YouPI: create payment, webhook with valid signature → payment recorded once; replayed `deliveryId` ignored; bad signature → 401; amount mismatch → flagged, not applied; polling fallback works.
- [ ] `mock` provider completes the same flow end-to-end.
- [ ] Outstanding vs paid visible at any moment; overdue list correct.

**Reporting & realtime**
- [ ] Dashboard shows active subscriptions, revenue collected, outstanding, overdue, MRR/ARR, with working filters and a summary view; numbers reconcile to raw SQL.
- [ ] Two-browser Playwright test: staff records payment → customer portal invoice flips to Paid and staff dashboard KPIs change **without refresh** in < 2 s.
- [ ] Billing run streams new invoices and progress live.
- [ ] Reconnect indicator works (kill network, restore → catches up).

**Performance & hygiene**
- [ ] With 5k subs / 30k invoices every page and RPC has p95 < 2 s (`docs/PERFORMANCE.md`).
- [ ] `typecheck`, `lint`, `test`, `build` pass in CI; no secrets in git history; README lets a stranger run the app in minutes.

---

## 17. FINAL DELIVERABLES

1. Working app deployed (Vercel + Supabase) with a public demo URL and fake demo accounts (admin / staff / customer).
2. All code, migrations, seeds, tests and docs pushed to https://github.com/MR-JK-37/Ten0vaPLu5 with a clean commit history and tag `v1.0.0`.
3. `docs/PROGRESS.md` with every §16 box genuinely ticked, `docs/DECISIONS.md`, `docs/BLOCKERS.md`, `docs/PERFORMANCE.md`.
4. A 3-minute demo script in `docs/DEMO.md`: sign up → admin launches plan → staff builds quote from template → confirm/activate → billing run (live) → customer pays via YouPI/mock (live Paid flip) → finance dashboard updates live.

**Start now with step 1 of §15. Do not ask for permission between steps. After each step, run the checks, commit, push, tick `PROGRESS.md`, and continue.**
</pasted_content id="4d88">
