# Blockers

Things that need a real external credential or service the agent cannot provision itself.
Each stays blocked on `mock`/local alternatives per AGENTS rule 4 — never stops the build.

## Open

- **GitHub Contributors panel / integration lag.** The commit history was rewritten to
  strip `Co-Authored-By: Claude …` trailers (see A10.0) and `gh api repos/.../contributors`
  now returns only `MR-JK-37`. GitHub's Contributors *panel* in the web UI is a separate,
  cached view and can lag the API by minutes to hours after a history rewrite. If `claude`
  still appears there after checking again later, go to **Settings → Integrations →
  Applications** (account-level) and the repo's **Settings → Collaborators** / **GitHub
  Apps** and revoke any Claude/Anthropic GitHub App or token with access — this is an
  account-level setting the agent cannot change from code.

- **Hosted Supabase project.** No project has been created at supabase.com. Needed for the
  deployed demo URL. Local dev uses the Supabase CLI's dockerized stack instead
  (`supabase start`). When ready: create a free-tier project, run
  `supabase link --project-ref <ref>`, then `supabase db push`.
- **Resend / Brevo SMTP API key.** `RESEND_API_KEY` is empty in `.env.example`. In local dev,
  Supabase's Mailpit (bundled with the CLI, http://127.0.0.1:54324) captures auth emails so
  reset-password links are inspectable without real SMTP.
- **YouPI-PG self-hosted gateway.** Not running anywhere yet. `PAYMENT_PROVIDER=mock` is the
  default so the full payment flow (checkout -> webhook -> invoice flips to Paid) works
  end-to-end without it. Switching to `youpi` requires: cloning
  `https://github.com/youpi-pg/YouPI-PG`, running it (Docker Compose, per its repo), and
  exposing it via a Cloudflare Tunnel so `YOUPI_BASE_URL` is reachable from the deployed app.
- **Vercel deployment / public demo URL.** Not deployed yet. Needs a Vercel account linked to
  this GitHub repo and the hosted Supabase project's env vars set there.
- **Android observer APK for real UPI verification.** Out of scope without a physical device;
  the `mock` provider is the full substitute for the demo per §9's own fallback guidance.

## Resolved

(none yet)
