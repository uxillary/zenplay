# Infrastructure

ZenPlay is a static Vite application with PWA assets, built into `dist/` and hosted on Cloudflare Pages. The documented production origin is `https://playadfree.games`; the Cloudflare Pages project name, build settings, and domain attachment are not present in this repository and require owner verification. The app also uses Supabase for optional email-code authentication and private profiles. Supabase Auth, Postgres/RLS, and the account-deletion Edge Function work together; game state and settings remain local to each device. No analytics or tracking service is configured.

Application build and PWA behavior live in `package.json` and `vite.config.ts`. Supabase's local project/auth settings, email templates, migrations, database tests, and function source live under `supabase/`. The two browser configuration names are listed in `.env.example`; future Stripe secrets and server Price IDs are documented there by name only and belong in Supabase Edge Function secrets. The M17C-A ledger and payment functions are not deployed or configured. Git reproduces the frontend build, PWA configuration, Supabase local configuration, schema migration, function code, tests, and email template source. It does not reproduce Cloudflare project settings or hosted Supabase dashboard state. See [M17C Stripe Payment Ledger & Trust Boundary](../context/M17C_STRIPE_PAYMENT_LEDGER_TRUST_BOUNDARY.md) for the Stripe trust model and M17C-B setup handoff.

There is no tracked Cloudflare deployment manifest, deployment script, or GitHub Actions workflow. The documented hosting provider is Cloudflare Pages, but its deployment mechanism (for example, dashboard-connected Git deployment or a CLI workflow) is not verifiable here. The Supabase local config identifies project `zenplay`; whether it maps to the live project is not verified by that value alone. See [services.md](services.md) for evidence and unknowns and [verify.md](verify.md) for production checks.

## M20B.1 build and local acceptance

`npm run build` now typechecks, compiles a pure React public-shell renderer into ignored `dist-ssr/`, then builds the browser assets into `dist/`. A Vite write hook emits final Home/Solitaire HTML and `404.html` before the existing PWA plugin generates its Workbox revisions. `dist-ssr/` is build-only and must never be published; there is no runtime SSR service. The deploy command/output remain `npm run build` / `dist`.

Only `/` and `/games/solitaire/` are implemented as public pages in this slice. The build emits an exact no-slash Solitaire 301 in `_redirects`; the top-level 404 opts out of Pages' default SPA fallback. Vite dev/preview use multipage mode with explicit slice aliases, not a homepage catch-all. The remaining games/utility panels keep their existing root history-state navigation. Final robots/sitemap and broader SEO release handling remain future work.

After building, `npm run verify:seo` checks final HTML, Workbox hashes and localhost HTTP behavior. `npm run test:seo-browser` exercises a disposable headless Edge/Chromium profile, including offline and explicit worker updates; `ZENPLAY_TEST_BROWSER` optionally selects its executable and is not a deployment variable. See [M20B.1 evidence](../context/M20B1_SEO_VERTICAL_SLICE.md). Local Vite checks do not certify Cloudflare redirect/header/404 settings. No hosting or account settings were changed or deployed in M20B.1.

## Instructions for agents

1. Read `infrastructure/README.md` and `infrastructure/services.md` before infrastructure work.
2. Treat repository configuration as the source of truth where possible.
3. Prefer version-controlled configuration first.
4. Prefer official CLI/API automation second.
5. Use dashboard/browser configuration only when necessary.
6. Never commit credentials or secret values.
7. Ask the owner before destructive operations, billing changes, domain changes, secret rotation, or production data changes.
8. Record infrastructure changes in the infrastructure documentation.
9. Run the checks in `infrastructure/verify.md` after production changes.
10. Never assume a remote setting matches repository documentation when it cannot be verified.
