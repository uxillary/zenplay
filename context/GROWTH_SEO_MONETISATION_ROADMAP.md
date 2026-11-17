# ZenPlay — Growth, SEO and Sustainable Revenue Roadmap
Updated: 2026-11-17. Planning document; proposals are not shipped features.

## Product goal
The best calm, familiar, accessible collection of classic browser games. Core games, accessibility, offline play, saves, hints and unlimited play remain free. No advertising, pay-to-remove-ads, consumable energy, paid hints, loot boxes or pressure tactics.

## Current state (repository evidence)
Eight available games: Solitaire, Sudoku, Pairs, Word Search, Noughts & Crosses, Fifteen Puzzle, Mahjong and Flags. React/Vite/TypeScript/Tailwind PWA, lazy game loading, local saves, optional Supabase account. Recent Solitaire mobile touch fixes exist; physical-device acceptance remains important. Supporter page is explicitly a fictional prototype; no purchase UI or entitlements are live. Stripe ledger foundation exists but remote payment acceptance and release readiness are not established.

## Strategic priorities (in order)
1. **M20 — SEO and discoverability architecture:** audit existing routes, metadata, rendering, Cloudflare Pages, PWA/offline caching, and indexability. Choose smallest safe architecture to provide independently crawlable, prerendered game pages. Preserve deep links, saves, offline operation and accessibility. See M20 plan.
2. **M21 — Site-wide UX:** polished homepage and game cards; continue playing; coherent mobile-first game shell, typography, settings and navigation. Real-device acceptance.
3. **M22 — Useful search content:** original illustrated and interactive guides, rules, beginner examples and printable puzzles. Prioritize Solitaire, Sudoku, Mahjong and Word Search. No mass-generated doorway pages.
4. **M23 — Optional monetisation:** validate Stripe integration and refund/account deletion/entitlement lifecycle; ship one small, permanent cosmetic or curated puzzle collection and/or voluntary support. Free experience remains generous and unchanged.
5. **M24 — Retention and distribution:** optional daily puzzles without streak pressure, sharing, favourites, useful printables and privacy-conscious aggregate measurement.

## SEO strategy
- Individual stable game URLs: /games/solitaire/, /games/sudoku/, /games/pairs/, /games/word-search/, /games/noughts-crosses/, /games/fifteen/, /games/mahjong/, /games/flags/.
- Meaningful server-delivered/prerendered HTML: title, description, H1, helpful introduction, playable game immediately available, instructions and relevant internal links. Avoid duplicative boilerplate.
- Sitemap, robots, canonical URLs, social cards, appropriate structured data only where valid. Verify redirect/canonical handling and PWA navigation fallback.
- Search themes to research, not claimed validated keywords: 'solitaire no ads', 'free sudoku online', 'mahjong solitaire no ads', 'large print word search', 'how to play solitaire', 'sudoku for beginners', 'games without ads', 'offline browser games'.
- Content should demonstrate real moves or solving steps; avoid misleading SEO claims, keyword stuffing, and indexable infinite generated puzzle variants.
- Set up Search Console and Bing Webmaster Tools, verify indexing and monitor impressions, clicks, queries, mobile usability and Core Web Vitals. No analytics service is currently documented; privacy review before adding one.

## Revenue experiments
- Voluntary support: £2/£5/£10 as exploratory tiers, not launched prices.
- Cosmetics: permanent card backs/table surfaces/tile art, exploratory £1.49–£3.99.
- Curated puzzle packs: substantial original themed content, exploratory £2.99–£5.99.
- Optional bundles/gifts later, after entitlement and restoration design.
- No purchases required to enjoy games, accessibility, undo, hints, saves or offline play.
- All purchases transparent, previews available, with restore, refunds, device/account deletion, VAT and payment fee policies reviewed. Never imply fictional supporter profiles are real.

## UX and quality
Immediate play, large legible targets, consistent controls, clear Continue, graceful offline/error states, accessible keyboard and screen-reader navigation, reduced motion and real-device QA. Do not add new games just to inflate the catalogue.

## Metrics and decision gates
Baseline before optimising: indexed URLs, impressions, organic clicks, landing-page engagement (privacy-reviewed), repeat visits (privacy-reviewed), Core Web Vitals and real-device defects. Revenue after launch: checkout completion, net receipts, refunds, pack conversion. Avoid invented traffic forecasts and rankings.

## Release policy
No speculative deployment, production domain changes, analytics, purchases, or credentials without owner approval. Work on branches, run tests/typecheck/lint/build, document evidence and unresolved checks. Existing docs may describe older MVP states; README and current source take precedence.
