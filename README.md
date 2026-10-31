# Brightloop Software — Subscription Management System

A real-time platform for the full life of a subscription business: products and plans,
quotations, recurring billing, payments, and revenue reporting — for admins, internal
staff, and self-service customers.

## Architecture

```
Next.js 16 (App Router, Server Actions)
        │
        ├── Supabase Postgres  — schema, RLS (every table), business-logic RPCs
        ├── Supabase Auth      — email/password, roles in profiles.role
        ├── Supabase Realtime  — postgres_changes, RLS-aware
        └── Supabase Storage   — (unused currently)
```

- **Database is the authority.** Role checks, the subscription/invoice state machines, tax
  and discount calculation, and the billing engine (`run_billing()`) are all Postgres
  functions, not application code — see `supabase/migrations/`.
- **Three-layer RBAC**: Postgres RLS on every table + a role-enum trigger that blocks
  self-escalation, `requireRole()`/`requireUser()` in every Server Action, and role-gated
  navigation in the UI (never trusted on its own).
- **Money** is always an integer in minor units (paise), formatted/rounded in one place
  (`lib/money/money.ts`).
- **Realtime** is one shared channel per dashboard mount
  (`components/realtime/connection-status.tsx`) that refreshes the current page's Server
  Components when a watched table changes — RLS-aware, so a customer only ever receives
  events for rows they could already read.

## Setup (local development)

Requires Node 22+, pnpm, Docker, and the Supabase CLI.

```bash
git clone https://github.com/MR-JK-37/Ten0vaPLu5
cd Ten0vaPLu5
pnpm install
cp .env.example .env.local        # fill in SEED_ADMIN_EMAIL/PASSWORD at minimum
supabase start                    # starts local Postgres/Auth/Realtime in Docker
pnpm seed:admin                   # creates the one seed admin account
pnpm dev                          # http://localhost:3000
```

To reset the local database to a clean state at any point: `supabase db reset`.

## Environment variables

See `.env.example` for the full list with placeholders. The ones you actually need to set
for local dev:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | printed by `supabase start` |
| `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD` | the one seed admin account (`pnpm seed:admin`) |
| `PAYMENT_PROVIDER` | `mock` (default, works with no external service) or `youpi` |
| `YOUPI_*` | only needed if `PAYMENT_PROVIDER=youpi` and a YouPI-PG server is running — see Known limitations |

## Demo accounts

After `pnpm seed:admin`, sign in as the seed admin to create staff accounts from
`/admin/users`. Customer accounts are self-sign-up at `/signup`. No real accounts or data
are shipped with the repo.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm build` / `pnpm start` | standard Next.js dev/build/start |
| `pnpm typecheck` / `pnpm lint` / `pnpm test` | strict TS, ESLint, Vitest unit tests |
| `pnpm test:rls` | scripted RLS matrix against the local stack — signs in as a real admin/staff/two customers and checks cross-role access (`tests/rls/matrix.ts`) |
| `pnpm test:subscriptions` | subscription state-machine + quotation-template flow against the local stack |
| `pnpm seed:admin` | creates/re-promotes the one seed admin account |
| `pnpm seed:demo` | generates demo-scale data (products/plans/customers/subscriptions/invoices) for perf testing — see `docs/PERFORMANCE.md` |
| `pnpm e2e` | Playwright end-to-end tests |

## Payments

Three providers behind one interface (`lib/payments/types.ts`), selected by
`PAYMENT_PROVIDER`:

- **manual** — staff record cash/bank transfer/cheque/card/UPI against an invoice from
  `/staff/payments` or `/admin/payments`. Always available regardless of the env setting.
- **mock** (default) — a customer's "Pay now" in the portal completes instantly. This is
  the full substitute for a live gateway in this environment (see Known limitations).
- **youpi** — online UPI checkout via a self-hosted
  [YouPI-PG](https://github.com/youpi-pg/YouPI-PG) instance, implemented to its documented
  API shape (`lib/payments/providers/youpi.ts`, `app/api/webhooks/youpi/route.ts`: raw-body
  HMAC-SHA256 signature verification, delivery-id dedup, amount/invoice matching). To use
  it: run YouPI-PG locally (it ships a `docker-compose.yml`), expose it with a Cloudflare
  Tunnel, and set `YOUPI_BASE_URL`/`YOUPI_WEBHOOK_SECRET`/`YOUPI_API_KEY` accordingly.

## Known limitations

- **No live YouPI-PG server.** The `youpi` provider and its webhook handler are built to
  the documented API shape and verified against a simulated signed caller (bad signature →
  401; valid signature + matching invoice/amount → payment recorded and invoice auto-paid;
  replayed delivery-id → deduped — see `docs/PROGRESS.md`), but have not been exercised
  against the real gateway. `mock` is the default and gives a complete end-to-end demo.
- **No transactional email provider configured.** Password-reset links and invoice "send"
  log to the server console in this environment instead of sending real email (see
  `docs/BLOCKERS.md`); the mechanism itself (neutral messaging, `sent_at` tracking) is real.
- **Billing-run progress is synchronous, not streamed.** The admin "Run billing now" button
  awaits completion and then shows the result; a live "412/600 invoiced" progress bar is not
  built.
- **Not deployed.** No hosted Supabase project or Vercel deployment exists yet for this
  environment — everything above is verified against the local Supabase CLI stack.

See `docs/DECISIONS.md` for other non-obvious choices and why, and `docs/PROGRESS.md` for
exactly what has been verified and how.

## Testing

- **Unit** (`pnpm test`): money/rounding — `lib/money/money.ts`.
- **RLS matrix** (`pnpm test:rls`): 16 cross-role assertions against the real Auth API and
  database, including the self-escalation bug this caught and fixed (see
  `docs/DECISIONS.md`).
- **Subscription flow** (`pnpm test:subscriptions`): 12 assertions covering numbering,
  quotation templates, the full state machine, and plan-rule enforcement.
- **E2E** (`pnpm e2e`): Playwright tests covering the main sign-in/catalog/billing/payment
  journeys per role.

Every feature in this repo was also verified manually end-to-end through the real running
UI (not just the database) before being committed — see the detailed notes in
`docs/PROGRESS.md`.
