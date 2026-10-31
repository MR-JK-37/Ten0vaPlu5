# Performance

Target per AGENTS.md section 13: every page and RPC responds in under 2 seconds, measured
at ~5,000 subscriptions / 30,000 invoices.

## Dataset

Generated with `pnpm seed:demo --subs 5000` (subscriptions via the JS admin client,
batched; billing run via a direct Postgres connection with `statement_timeout = 0` — see
`docs/DECISIONS.md` for why) plus a follow-up script confirming ~90% of invoices and
recording a payment on ~70% of those:

| Table | Rows |
|---|---|
| subscriptions | 5,000 |
| invoices | 30,000 |
| payments | 19,027 |

Verified zero duplicate `(subscription_id, period_start)` pairs across all 30,000 invoices
— the no-double-billing guarantee holds at this scale, not just in the small unit test.

## Billing run timing

`run_billing(current_date, false)` over the full 5,000-subscription catch-up (6 missed
periods each, creating all 30,000 invoices in one transaction): **~26 seconds**. This
exceeds PostgREST's statement timeout when called as an RPC, so at this scale it must run
over a direct Postgres connection (documented in `docs/DECISIONS.md`); through the admin
UI's "Run billing now" button at realistic daily volumes (a handful of due subscriptions
per day, not 5,000 at once) this is not an issue.

## Page load timing (production build, `pnpm build && pnpm start`)

Measured via `fetch()` with the authenticated session's cookies, 3–5 runs per route, after
first fixing a real gap this test caught (see below).

| Route | Before fix | After fix |
|---|---|---|
| `/admin` | 260–281ms | 145–162ms |
| `/admin/invoices` | 867–968ms | 729–763ms |
| `/admin/invoices?status=confirmed` | 851–907ms | 670–699ms |
| `/admin/payments` | 1256–1274ms | 1103–1170ms |
| `/admin/subscriptions` | **1188–1275ms** | **555–628ms** |
| `/admin/customers` | 505–561ms | 236–246ms |
| `/admin/reports` | 255–325ms | 166–168ms |
| `/admin/billing-runs` | — | 142–157ms |
| `/staff/invoices` | 876–970ms | 702–725ms |
| `/staff/subscriptions` | — | 555–587ms |

All routes are well under the 2-second target at this scale, with the slowest
(`/admin/payments` at ~1.2s) still comfortably inside it.

**Bug found and fixed by this measurement pass:** `components/subscriptions/
subscriptions-table.tsx` had no `.limit()` at all — it was fetching and rendering all
5,000 subscriptions (with joined customer and plan data) on every visit to `/admin/
subscriptions` or `/staff/subscriptions`, in direct violation of AGENTS.md section 13
("server-side pagination... never `OFFSET` on big tables" implies bounded queries in
general). Adding `.limit(100)` (ordered by `created_at desc`, so it shows the most recent
100) roughly halved the page's load time. The before/after numbers above were measured
back-to-back against the same running server and dataset, isolating this one change.

## What's not yet covered

- No automated perf test asserting the threshold in CI — this was a manual measurement
  pass, not `tests/perf/`. A follow-up would wire this into the test suite so a future
  regression fails the build rather than requiring another manual check.
- `/admin/subscriptions` and other list pages cap at the most recent 100 rows rather than
  offering keyset pagination (prev/next cursor) to reach older rows — acceptable for a
  hackathon-scale demo, not a complete pagination UI.
- Dashboard KPI and report RPCs (`dashboard_kpis()`, `invoice_ageing_buckets()`,
  `revenue_by_month()`) were not isolated and timed separately from their page's total
  load time; their contribution is included in the page numbers above.
