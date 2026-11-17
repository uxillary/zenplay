# M20 — Search Discoverability Foundation
Status: M20B.2 COMPLETE LOCALLY / AUTOMATED ACCEPTANCE PASSED / M20C RELEASE REVIEW PENDING
Date: 2026-11-17

## Goal
Make ZenPlay's eight games discoverable via individual, crawlable, high-quality pages without sacrificing the React game experience, local persistence, accessibility, installability or offline play.

## M20A baseline evidence (before implementation)
- `index.html` uses a generic `ZenPlay` title and generic description, with React content mounted under `#root`.
- `src/app/App.tsx` navigates via `history.pushState` while retaining the current URL, rather than navigating to game-specific paths.
- `src/app/gameRegistry.ts` already defines `/games/{id}` targets, but these are not currently used as the main app's game URLs.
- No tracked `public/robots.txt` or `public/sitemap.xml` was found.
- `vite.config.ts` uses Workbox navigateFallback `index.html`. Deep-link and offline behavior require deliberate review.
- Cloudflare Pages production configuration and actual Google index status were not verified in this planning pass. Do not claim either as audited.

## M20A — Architecture audit (complete; approved for M20B.1)
1. Inspect all navigation, GameCard, game registry, state restoration, history/popstate, install/start URLs and Workbox behavior.
2. Verify Cloudflare Pages routing and redirects from repository evidence; list remote settings requiring owner confirmation.
3. Compare (a) minimal Vite static prerender / multipage strategy, (b) Astro static shell embedding React game islands, (c) another justified minimal option. Score build complexity, SEO HTML, PWA integration, deployment, bundle cost and migration risk.
4. Define canonical URL map and legacy navigation compatibility, direct reloads, browser back/forward, refresh, bookmarks and offline installed app behavior.
5. Specify HTML content model for each game: unique title, description, H1, concise genuinely useful rules, accessible game region, related links and structured data only if eligible.
6. Establish automated checks for output HTML, canonical/sitemap correctness, direct-route reload, noindex rules, accessibility, and preservation of game saves.
7. Produce an architecture decision record and a small implementation plan. Do not perform an unapproved framework migration.

### Outcome — 2026-11-17

See [M20A SEO Architecture Decision](M20A_SEO_ARCHITECTURE_DECISION.md) for verified findings, alternatives, URL/content contracts, risks, implementation order and automated/manual acceptance matrices.

- **Recommend retaining React/Vite and adding a build-time prerendered public shell**, hydrated with the existing lazy client games. No Astro migration, runtime SSR service or new runtime dependency is recommended for M20B.
- Canonical game URLs use the existing eight registry IDs under `/games/{id}/` with trailing slashes. Homepage remains `/`; initial sitemap contains nine public URLs. Settings/Profile/Support/Install gain refreshable, noindex utility shells. Future guides are reserved for M22, with no placeholder/bulk pages.
- Pathname becomes authoritative; real links support progressive client navigation. Preserve valid legacy root history state through a narrow one-time migration; explicit paths override stale state. Back to Games must navigate to `/` safely on direct entry.
- Build final HTML before Workbox generates its precache. Replace the broad homepage navigation fallback with exact static-page resolution; preserve root PWA identity, explicit update acceptance and all-eight-game offline coverage after readiness.
- Keep the same origin, save/game IDs and formats, IndexedDB database/stores, local settings/profile keys and optional Supabase email-code flow. No payment/account/privacy changes.
- **Verified baseline:** 213 tests pass; typecheck, lint and production build pass. Built HTML has an empty React root; the local Vite preview returned the same HTML for sampled game and missing paths, robots and sitemap. Main JS is 474.90 kB uncompressed / 138.34 kB gzip; Workbox reports 236 entries / 5,318.97 KiB. These are local build/probe results, not production or field performance evidence. Existing Browserslist age warning remains.
- **Unverified:** actual Cloudflare project/build/branch/redirect/header state, live canonical/index status, Search Console/Bing data, physical-device offline/install/update acceptance and field Core Web Vitals. No production deployment or hosted change was performed.

### Current next steps

1. Review [M20B.2 catalogue evidence](M20B2_COMPLETE_SEO_CATALOGUE.md); the B.1 architecture has now been extended to the full catalogue without a framework migration.
2. Complete M20C physical-device/accessibility and authorized hosted checks, including the confirmed production branch/indexing configuration.
3. Separately authorize any merge/push/deployment. Search Console/Bing indexing and field performance remain later remote checks, not inferred from builds.

## M20B.1 — Home + Solitaire vertical slice (local acceptance passed)

See [M20B.1 implementation and evidence](M20B1_SEO_VERTICAL_SLICE.md).

- Dedicated branch: `codex/m20b1-seo-vertical-slice`, based on fetched/current main at `abd855d`. No merge, push or deployment.
- `/` and `/games/solitaire/` now have distinct deterministic initial HTML, unique title/description/canonical/H1, shared accessible content and a client-only game boundary. Solitaire remains lazy and begins automatically after hydration.
- Typed path/history foundation, real Solitaire/Continue/Home links, direct entry/refresh/Back/Forward and narrowly upgraded legacy root entries are implemented. Other games/utility panels retain their root history-state flows; no further game routes were added.
- Final HTML is emitted before Workbox hashing. Homepage catch-all navigation is removed; exact page precaching, top-level 404 and Solitaire alias handling are implemented. Manifest identity and prompt-controlled updates remain intact.
- Delayed-write browser testing exposed a stale-Continue race. Solitaire restoration now waits for its existing pending queue, without changing save formats, rules or card/gesture components.
- **Verified:** 224 tests, typecheck, lint, build, final output/HTTP/precache verifier, headless Edge acceptance and diff/whitespace checks pass. Browser coverage includes JS-disabled text, hydration with no console warnings, navigation, old saves/settings/profile/statistics, queued writes, emulated touch drag, Home-only offline setup and user-controlled worker updates.
- Final Home/Solitaire HTML is 6,308/4,018 bytes. Bootstrap + App gzip is about 140.81 kB versus 138.34 kB baseline; precache is 239 entries / 5,336.44 KiB versus 236 / 5,318.97 KiB. No field/lab speed improvement is claimed from file sizes.
- **Not verified:** real Cloudflare routing/headers, production indexing, live account lifecycle, physical installation/VoiceOver/NVDA/zoom acceptance or field CWV. No final sitemap/robots/social/structured-data release has been implemented.

## M20B.2 — Complete catalogue (local acceptance passed)

See [M20B.2 implementation and route matrix](M20B2_COMPLETE_SEO_CATALOGUE.md).

- All eight `/games/{id}/` pages and Home have useful initial HTML, unique metadata, absolute canonicals, social tags, honest JSON-LD and relevant internal links. Settings/Profile/Support/Install have refreshable neutral shells with noindex,follow.
- Exactly nine public canonical URLs appear in sitemap.xml. Robots, top-level 404, twelve exact slash redirects and indexing headers are generated before Workbox hashing. Unknown/mixed-case paths return actual local 404s; no SPA catch-all.
- Progressive routing covers all screens, explicit Home and safe Support → Profile. Unversioned and partial B.1 root history entries migrate to canonical paths; new state is version 2.
- B.1's pending-write barrier now protects all six resumable games. Browser fixtures retained schema-1 saves/session IDs/statistics/settings/profile across real moves, Continue, refresh and updates. No persistence formats/game rules changed, and no unfinished-game resume was added to Noughts & Crosses or Flags.
- Local no-JS/HTTP/browser checks cover all thirteen pages. All game/utility documents load/reload offline after Home-only readiness; final HTML precache hashes and eight lazy game chunks pass validation. User-controlled updates and private-response cache exclusion were verified with local fixtures.
- **Verification:** 229 tests, typecheck, lint, build, SEO verifier, headless browser acceptance and whitespace checks passed. Automated accessibility smoke covers H1/main, named controls, keyboard/skip focus and mobile widths; physical screen-reader/device acceptance remains M20C.
- **Release configuration required:** Cloudflare builds stay noindex until `ZENPLAY_PRODUCTION_BRANCH` matches the actual `CF_PAGES_BRANCH`. `ZENPLAY_NOINDEX=1` forces noindex for other staging builds; local preview sends a noindex header. No hosted setting was changed. Confirm production/preview behavior before publishing.
- Compared with B.1, bootstrap/App gzip is 144.37 kB versus 140.81 kB (+2.53%); Workbox reports 250 entries / 5,408.09 KiB versus 239 / 5,336.44 KiB (+1.34%). CSS is unchanged. These are build sizes, not measured CWV/speed improvements.
- No new packages, games, payment changes, analytics, deployment, merge, commit or push. Live Cloudflare/indexing/Supabase acceptance and physical devices remain unverified.

## M20B — Full foundation (implemented locally; release acceptance pending)
- Introduce crawlable, direct game URLs and prerendered HTML using approved architecture.
- Add sitemap, robots, canonical tags, page metadata, Open Graph assets and accessible internal links.
- Keep the playable game near the top; instructional content below it.
- Preserve navigation, existing IndexedDB data, Supabase account lifecycle, PWA updates and offline behavior.
- Update docs and add targeted regression tests.

## M20C — Acceptance
- Fresh HTTP requests to each game URL return meaningful HTML without executing JS.
- Each URL renders its intended game on client load and refresh; Back/Forward and bookmarks work.
- Unique metadata, sitemap and canonical URLs pass automated checks.
- Offline and PWA install/update tests pass on real supported devices; no save loss.
- Mobile keyboard, zoom, screen reader and reduced motion checks recorded.
- Search Console and live indexing are owner/remote verification, not assumed from a build.

## Non-goals
No new games, payment activation, redesign, bulk SEO articles, remote infrastructure edits or production deployment in M20A.
