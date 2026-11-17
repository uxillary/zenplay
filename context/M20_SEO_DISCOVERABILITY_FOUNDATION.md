# M20 — Search Discoverability Foundation
Status: PLANNED / INSPECTION FIRST
Date: 2026-11-17

## Goal
Make ZenPlay's eight games discoverable via individual, crawlable, high-quality pages without sacrificing the React game experience, local persistence, accessibility, installability or offline play.

## Evidence from current main
- `index.html` uses a generic `ZenPlay` title and generic description, with React content mounted under `#root`.
- `src/app/App.tsx` navigates via `history.pushState` while retaining the current URL, rather than navigating to game-specific paths.
- `src/app/gameRegistry.ts` already defines `/games/{id}` targets, but these are not currently used as the main app's game URLs.
- No tracked `public/robots.txt` or `public/sitemap.xml` was found.
- `vite.config.ts` uses Workbox navigateFallback `index.html`. Deep-link and offline behavior require deliberate review.
- Cloudflare Pages production configuration and actual Google index status were not verified in this planning pass. Do not claim either as audited.

## M20A — Architecture audit (next task)
1. Inspect all navigation, GameCard, game registry, state restoration, history/popstate, install/start URLs and Workbox behavior.
2. Verify Cloudflare Pages routing and redirects from repository evidence; list remote settings requiring owner confirmation.
3. Compare (a) minimal Vite static prerender / multipage strategy, (b) Astro static shell embedding React game islands, (c) another justified minimal option. Score build complexity, SEO HTML, PWA integration, deployment, bundle cost and migration risk.
4. Define canonical URL map and legacy navigation compatibility, direct reloads, browser back/forward, refresh, bookmarks and offline installed app behavior.
5. Specify HTML content model for each game: unique title, description, H1, concise genuinely useful rules, accessible game region, related links and structured data only if eligible.
6. Establish automated checks for output HTML, canonical/sitemap correctness, direct-route reload, noindex rules, accessibility, and preservation of game saves.
7. Produce an architecture decision record and a small implementation plan. Do not perform an unapproved framework migration.

## M20B — Implementation (after M20A review)
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
