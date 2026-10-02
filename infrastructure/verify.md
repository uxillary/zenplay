# Production verification checklist

Run only after a production change, against the intended production resources. Confirm project identity before applying migrations or deploying a function. Use a disposable account for deletion checks.

## Static site and deployment

- [ ] Open `https://playadfree.games` and confirm the site loads over HTTPS.
- [ ] Confirm the latest intended Cloudflare Pages deployment succeeded and serves the expected commit/build.
- [ ] Confirm the custom domain is attached, HTTPS is valid, and the app routes/load path work on the canonical origin.
- [ ] Confirm Cloudflare production build settings use `npm run build` and `dist/` and both public Supabase values are set for the correct environment when accounts are enabled.
- [ ] Install/open the PWA and verify the service worker can load the app offline after a successful initial load.

## Supabase and account flow

- [ ] Confirm the deployed app uses the intended Supabase project URL and publishable key; do not expose a secret/service-role key in the built assets.
- [ ] Request a code for a new disposable email and for an existing test account; verify delivery, six-digit code entry, session persistence, sign-out, and sign-in again.
- [ ] Confirm hosted Auth Site URL, allowed redirect URLs, signup/confirmation policy, OTP length/expiry/resend limits, both email templates, and verified production SMTP sender match the intended configuration. The current typed-code flow should not require a redirect callback.
- [ ] Read, create, and update a private profile as its owner. Verify a different authenticated user cannot read or modify it, and anonymous access is denied (RLS).
- [ ] Confirm the intended migration is present in the target database; compare migration history before any `supabase db push`.
- [ ] Confirm the `delete-account` Edge Function is deployed to the intended project. With a disposable account, verify unauthenticated calls fail, authenticated self-deletion succeeds, the local browser session clears, and the user's auth/profile data is removed as expected.
- [ ] Verify allowed production CORS origin is the canonical site and unexpected origins are rejected.

## Release hygiene

- [ ] Confirm no secret values are present in Git, build output, client environment variables, or logs. Keep Supabase function credentials provider-managed.
- [ ] Recheck that local-only saves, statistics, settings, and local profile remain intact and are not included in online account deletion.
- [ ] Record changed hosted settings and verification results in the infrastructure docs without recording credentials.
