# ZenPlay

ZenPlay is a calm collection of seven familiar games: Solitaire, Sudoku, Pairs, Word Search, Noughts & Crosses, Fifteen Puzzle, and Mahjong Solitaire. There are no adverts or tracking, and an account is optional. Accessibility settings include larger text and game pieces, high contrast, reduced motion, and Simple Mode.

## Install and offline play

Use **Install ZenPlay** when your browser offers it, or follow the browser-specific instructions in the app. On iPhone and iPad, open ZenPlay in Safari, tap **Share**, then **Add to Home Screen**.

After the app has loaded successfully and its offline copy is ready, the app and all seven games work without a network connection. Saved games, statistics, local profiles, and accessibility settings stay on this device. Optional account features require a connection and never block play. A new version waits for you to choose **Update now**; it does not refresh an active game automatically.

## Development

See [infrastructure/README.md](infrastructure/README.md) for the service inventory, configuration boundaries, and production verification checklist.

Use Node.js **20.19+** or **22.12+** (Node.js 24 is also supported). Install dependencies, then run:

```bash
npm install
npm run dev
```

Build and preview the production app with `npm run build` and `npm run preview`. Service workers are enabled for the production build; use `localhost` or HTTPS to test installation and offline behaviour.

## Optional online account development

Accounts are optional and appear in **Profile** only when Supabase is configured. Without configuration, ZenPlay stays local and works normally. The email address is handled by Supabase Auth and is not copied into the local profile. Connecting a profile uploads only the display name and selected favourite game after explicit confirmation. Game saves, statistics, settings, and the local profile ID stay on the device. Authentication sessions are persisted by the Supabase browser client in browser storage; the remote private profile is not cached by the app for offline use.

The Profile screen also links to a static Support ZenPlay prototype. Its fictional examples and illustrative milestones are not connected to payments or real supporter status; no purchases are available.

1. Create a Supabase project and select a region after the privacy/data-location review. Install the Supabase CLI separately (it is not an app dependency).
2. Copy `.env.example` to `.env.local` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The publishable key is public. Never use a secret/service-role key or database password in a `VITE_` variable.
3. In Supabase Auth, keep the intended email-confirmation policy enabled, set OTP length to six digits and expiry to 600 seconds, then configure **both** Email Templates: **Confirm sign up** and **Magic Link / OTP**. Copy the corresponding repository templates, `supabase/templates/confirmation.html` and `supabase/templates/magic_link.html`, into the dashboard. Both must use `{{ .Token }}` as a six-digit code and must not include `{{ .ConfirmationURL }}`. New accounts use Confirm sign up; existing accounts use Magic Link / OTP. ZenPlay verifies the code in the page and does not depend on a redirect or email link. Set Site URL to ZenPlay's canonical production origin and allowlist only origins actually needed elsewhere. Configure a verified production SMTP sender; the default hosted mail service is for development/testing. See Supabase's [email OTP](https://supabase.com/docs/guides/auth/auth-email-passwordless), [email templates](https://supabase.com/docs/guides/auth/auth-email-templates), [email delivery](https://supabase.com/docs/guides/auth/auth-smtp), and [redirect URL](https://supabase.com/docs/guides/auth/redirect-urls) guides.
4. For local services, start Docker and run `supabase start`. Use the local API URL and publishable key it reports in `.env.local`. Then run `supabase test db` to execute the RLS policy tests. See the current [Supabase CLI workflow](https://supabase.com/docs/guides/local-development/cli-workflows).
5. To apply the migration to a hosted project, authenticate with `supabase login`, link the project with `supabase link --project-ref <project-ref>`, review `supabase db push --dry-run`, then apply with `supabase db push`. Do not use `db reset --linked` on a production project.
6. Add the same two `VITE_` values as build-time environment variables in Cloudflare Pages. Restart the Vite dev server after changing `.env.local`.

**Current hosted account status:** the owner reports that production email OTP, sign-in/sign-out, session persistence, and an explicitly connected private profile have been tested successfully. The private profile migration and hosted RLS tests are also reported complete. Repository implementation now includes self-service online account deletion through a Supabase Edge Function; deploy that function before testing deletion with a disposable account. This repository change has not been deployed or verified against hosted deletion. Local profile, games, saves, statistics, settings, and accessibility preferences remain on-device and are not part of online deletion. Payments and supporter entitlement handling remain deferred.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```
