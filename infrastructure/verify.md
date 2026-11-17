# Production verification checklist

Run only after a production change, against the intended production resources. Confirm project identity before applying migrations or deploying a function. Use a disposable account for deletion checks.

## Static site and deployment

- [ ] Open `https://playadfree.games` and confirm the site loads over HTTPS.
- [ ] Confirm the latest intended Cloudflare Pages deployment succeeded and serves the expected commit/build.
- [ ] Confirm the custom domain is attached, HTTPS is valid, and the app routes/load path work on the canonical origin.
- [ ] Confirm Cloudflare production build settings use `npm run build` and `dist/` and both public Supabase values are set for the correct environment when accounts are enabled.
- [ ] Install/open the PWA and verify the service worker can load the app offline after a successful initial load.

## SEO catalogue and indexing (M20C)

- [ ] Confirm the actual Pages production branch and `ZENPLAY_PRODUCTION_BRANCH` match. Check production public pages have indexable HTML/headers and robots permits crawling; do not publish a noindex build accidentally.
- [ ] Confirm preview/staging HTML/headers are noindex and its robots policy matches the intended environment; use `ZENPLAY_NOINDEX=1` for other staging builds.
- [ ] Request Home and all eight `/games/{id}/` paths without JavaScript/service workers: verify correct 200 HTML, unique metadata, self-canonicals under `https://playadfree.games`, social assets and honest structured data.
- [ ] Check Settings/Profile/Support/Install refresh and return noindex,follow. Verify the sitemap has exactly Home plus the eight game URLs, excluding utilities/aliases/errors.
- [ ] Check robots/sitemap MIME types, exact no-slash redirects, directory-index normalization, query preservation and unknown/case-mixed path 404s. Confirm no wildcard SPA rewrite overrides generated files.
- [ ] Deploy only `dist/`, never `dist-ssr/`. Compare final HTML hashes/precache revisions and test Home-only readiness followed by offline direct entry to every game/utility.
- [ ] On supported physical devices, verify waiting/Later/explicit update across two actual asset sets, retained saves/settings, installation identity, screen-reader/keyboard focus, large text/zoom and reduced motion.
- [ ] After authorized release, inspect Search Console/Bing rendering/canonical selection and submit the nine-URL sitemap. Record results without asserting rankings or rich-result eligibility from JSON validity alone.

## Supabase and account flow

- [ ] Confirm the deployed app uses the intended Supabase project URL and publishable key; do not expose a secret/service-role key in the built assets.
- [ ] Request a code for a new disposable email and for an existing test account; verify delivery, six-digit code entry, session persistence, sign-out, and sign-in again.
- [ ] Confirm hosted Auth Site URL, allowed redirect URLs, signup/confirmation policy, OTP length/expiry/resend limits, both email templates, and verified production SMTP sender match the intended configuration. The current typed-code flow should not require a redirect callback.
- [ ] Read, create, and update a private profile as its owner. Verify a different authenticated user cannot read or modify it, and anonymous access is denied (RLS).
- [ ] Confirm the intended migration is present in the target database; compare migration history before any `supabase db push`.
- [ ] For payment rollout only after M17C-B approval: verify payment-ledger RLS and pgTAP checks in the intended project; confirm the Stripe Edge Function secrets and test Price mappings without exposing values; do not test live charges during test-mode setup.
- [ ] Confirm the `delete-account` Edge Function is deployed to the intended project. With a disposable account, verify unauthenticated calls fail, authenticated self-deletion succeeds, the local browser session clears, and the user's auth/profile data is removed as expected.
- [ ] Verify allowed production CORS origin is the canonical site and unexpected origins are rejected.

## Release hygiene

- [ ] Confirm no secret values are present in Git, build output, client environment variables, or logs. Keep Supabase function credentials provider-managed.
- [ ] Recheck that local-only saves, statistics, settings, and local profile remain intact and are not included in online account deletion.
- [ ] Record changed hosted settings and verification results in the infrastructure docs without recording credentials.
