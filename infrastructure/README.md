# Infrastructure

ZenPlay is a static Vite application with PWA assets, built into `dist/` and hosted on Cloudflare Pages. The documented production origin is `https://playadfree.games`; the Cloudflare Pages project name, build settings, and domain attachment are not present in this repository and require owner verification. The app also uses Supabase for optional email-code authentication and private profiles. Supabase Auth, Postgres/RLS, and the account-deletion Edge Function work together; game state and settings remain local to each device. No analytics or tracking service is configured.

Application build and PWA behavior live in `package.json` and `vite.config.ts`. Supabase's local project/auth settings, email templates, migrations, database tests, and function source live under `supabase/`. The two browser configuration names are listed in `.env.example`; future Stripe secrets and server Price IDs are documented there by name only and belong in Supabase Edge Function secrets. The M17C-A ledger and payment functions are not deployed or configured. Git reproduces the frontend build, PWA configuration, Supabase local configuration, schema migration, function code, tests, and email template source. It does not reproduce Cloudflare project settings or hosted Supabase dashboard state. See [M17C Stripe Payment Ledger & Trust Boundary](../context/M17C_STRIPE_PAYMENT_LEDGER_TRUST_BOUNDARY.md) for the Stripe trust model and M17C-B setup handoff.

There is no tracked Cloudflare deployment manifest, deployment script, or GitHub Actions workflow. The documented hosting provider is Cloudflare Pages, but its deployment mechanism (for example, dashboard-connected Git deployment or a CLI workflow) is not verifiable here. The Supabase local config identifies project `zenplay`; whether it maps to the live project is not verified by that value alone. See [services.md](services.md) for evidence and unknowns and [verify.md](verify.md) for production checks.

## SEO build and local acceptance (M20B.2)

`npm run build` typechecks, compiles the pure public-shell renderer into ignored `dist-ssr/`, then builds browser assets into `dist/`. A Vite write hook emits Home, eight game pages, four utility shells, 404 and discovery files before Workbox hashes the final HTML. `dist-ssr/` is build-only and must never be published; no runtime SSR service is required. Deployment command/output remain `npm run build` / `dist`.

The sitemap contains exactly nine production-canonical URLs (Home plus games), all under `https://playadfree.games`. Utility pages are noindex,follow and excluded. Generated `_redirects` has twelve exact no-slash 301s; `404.html` opts out of Pages' SPA fallback. Vite dev/preview resolve the same known routes without a homepage catch-all. The preview server also enforces exact case/unknown-route 404s on Windows while keeping the literal 404 asset installable by Workbox.

**Indexing configuration must be reviewed before release.** On Cloudflare (`CF_PAGES=1`), builds allow indexing only when `CF_PAGES_BRANCH` equals the explicitly set `ZENPLAY_PRODUCTION_BRANCH`. Missing/mismatched configuration generates noindex HTML/global `_headers` and robots disallow, including on a production branch. Do not assume the hosted production branch is `main`. Non-production Vite modes or `ZENPLAY_NOINDEX=1` also force this policy; use the latter for other public staging hosts. Normal local production builds allow public-page indexing for artifact inspection; local Vite preview always sends a noindex header. No environment values/settings were changed remotely by this work.

After building, run `npm run verify:seo` for final HTML, social/JSON-LD/discovery, precache hashes/install responses and localhost HTTP validation. `npm run test:seo-browser` uses a disposable headless Edge/Chromium profile for all routes, gameplay/saves, accessibility smoke and offline/explicit updates. `ZENPLAY_TEST_BROWSER` optionally selects its executable; it is not a deployment variable. See [M20B.2 evidence](../context/M20B2_COMPLETE_SEO_CATALOGUE.md). Local checks do not certify live Cloudflare headers/redirects/domain/indexing, physical installation or hosted account lifecycle. Complete [verify.md](verify.md) only after a separately authorized production change.

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
