# M20A — SEO architecture decision

Date: 2026-11-17

Status: **RECOMMENDED FOR REVIEW — M20B NOT STARTED**

## Decision

Keep React, Vite, Tailwind and `vite-plugin-pwa`. Add a small, deterministic **build-time prerender of the public page shell**, backed by a shared route/content catalogue. Serve real static HTML for the homepage and each of the eight games. Hydrate that shell and mount the existing, lazy React games on the client. Use real links with progressive client navigation. Do not server-render random boards, local saves, account state or accessibility settings.

This is static-site generation on the existing stack, not a production SSR service or a framework migration. It gives crawlers useful first-response HTML and users the existing game experience. No runtime server, Pages Function, router library, head manager or prerender dependency is required for the recommended scope. A small amount of build orchestration and a clear static/client boundary are required; these must be proved in M20B before expanding to all pages.

Review this architecture before M20B. Approval of this document would authorize implementation planning, not production deployment, domain changes, payments or a framework migration.

## Evidence and audit boundary

- Repository: `uxillary/zenplay`, local `main` at `e702417c411c108ed0dffb50b4a4a6676bb54e70`.
- Fetched `origin/planning/m20-discoverability` at `40b8c87292aa6f13c0dacb52a4e078a90d64b031` before the audit. Its only differences from the inspected main were the growth roadmap and M20 foundation documents. Those documents were copied into the working tree without a checkout or merge; the growth roadmap is unchanged.
- The working tree was clean at the start. M20A changes only planning documents; no app, save, build configuration, hosted setting or production resource was changed.
- Read all requested entry documents, then inspected the relevant navigation/card/shell, accessibility, persistence, account and PWA sources and generated production output. README/current code take precedence over historical MVP statements in `ZENPLAY_PROJECT_CONTEXT.md` (including its old single-game/no-account description).
- **Verified locally** means source inspection, generated output, commands or the local HTTP probe below. **Documented platform behavior** means official documentation, not observation of this project's hosting. **Proposed** means the M20B design; it has not been implemented or device-tested.
- No authenticated Cloudflare/Supabase dashboard inspection, production HTTP audit, Search Console/Bing data, real-device PWA run, Lighthouse run or field Core Web Vitals measurement was performed. Existing owner-reported account acceptance in README is not new M20A verification.

## Findings

| Area | Verified local finding | Consequence |
| --- | --- | --- |
| Routing/history | `App.tsx` initializes from `history.state.zenplayNavigation`; `navigation.ts` validates screen and game ID. `pushState` retains `window.location.href`. `popstate` uses state, falling back to Home. No pathname/hash/query route parsing exists. | Back/Forward can restore screens within the same session, and a reload can restore a valid retained history state. A fresh tab/bookmark cannot identify a game from its URL; a fresh game-path request becomes Home. |
| Links/deep entry | `gameRegistry.ts` contains eight `/games/{id}` targets without trailing slashes, but `GameCard.tsx` opens games with buttons/callbacks. Continue uses the same navigation callback. Visible Back to Games calls `history.back()`. | No crawlable game anchors; opening/copying a game link is unavailable. A direct-entry page needs an explicit Home destination, since browser Back may leave the site. |
| HTML/indexability | `src/main.tsx` calls `createRoot`; source and built `index.html` have an empty `#root`. Only generic title/description are present. | Google can render JavaScript, so this is not proof that the homepage is unindexable. It does prevent independently delivered game content and gives non-JS crawlers no game text or links. See [Google's JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics). |
| SEO assets | No tracked robots, sitemap, canonical, Open Graph/Twitter tags or JSON-LD found in app/public/build configuration. No top-level `404.html`, `_redirects` or `_headers` is tracked. | Need explicit page identity, discovery files, missing-page handling and preview indexing policy. |
| Hosting | Infrastructure docs specify static Cloudflare Pages, `npm run build`, output `dist/`, documented origin `https://playadfree.games`. No tracked deployment manifest/workflow or project identity. | Static directory pages fit the documented provider. Actual deployed routing, redirects, build branch, variables and headers remain unknown. |
| PWA | Prompt registration; manifest `id`, `scope`, `start_url` are `/`. Workbox precaches JS/CSS/HTML/SVG/PNG/ICO and binds every unmatched navigation to `index.html`; `skipWaiting` and `clientsClaim` are false. App offers updates outside games only. | Preserve installation identity and user-controlled updates. Replace the broad homepage fallback when real page HTML is added; otherwise unknown URLs and missing variants can receive misleading homepage HTML. |
| Persistence | IndexedDB `zenplay-local`, version 1, stores `gameSaves` and `statistics` keyed by game ID. Save/statistics schemas are version 1. Six games expose Continue loaders; Noughts & Crosses and Flags do not. Solitaire/Sudoku queue async writes. | Paths need no save migration on the same origin. Keep IDs/schema/serializers unchanged. Preserve in-document navigation and test rapid moves/navigation against pending writes. Do not advertise save/resume for all eight games. |
| Preferences/account | `zenplay-settings` (settings version 5) and `zenplay-local-profile` remain local. Accessibility provider reads browser storage at initialization and applies global classes/CSS variables. Supabase client persists sessions, refreshes tokens and has `detectSessionInUrl: false`; sign-in uses typed email OTP. | Existing App/provider cannot simply be prerendered unchanged. Keep browser-dependent runtime behind the client boundary. Same-origin path changes need no new Auth callback or CORS origin. No gameplay/profile/account data belongs in static HTML or SW runtime caches. |
| Loading | All eight game screens use `React.lazy` with accessible loading status and error boundary. App eagerly imports profile/settings/support UI; registry imports six save loaders. | Preserve game splitting. Server-side public content must not import runtime registry/save/account code. Account/support splitting is a possible measured follow-up, not a prerequisite refactor. |

### Measured baseline

Using Node `v24.21.0`, npm `11.19.0`, installed Vite `7.3.1` and PWA plugin `1.2.0`:

| Check | Result |
| --- | --- |
| `npm test` | Passed: 213 tests, 0 failures. Existing unit/source tests do not establish browser routing, accessibility or SW acceptance. |
| `npm run typecheck` | Passed. Production build also ran `tsc -b`, covering referenced app/node projects. |
| `npm run lint` | Passed. |
| `npm run build` | Passed; 152 modules transformed. Existing warning: Browserslist data is nine months old. No dependency update was made. |
| Document checks | `git diff --check` and explicit new-file whitespace checks passed after removing a trailing-space issue; local document links and the eight-route map were checked. |
| Output inspection | One HTML page, 952 bytes, with empty root. One HTML precache entry: `index.html`. Generated navigation handler binds to that page. |
| Main JS | 474,897 bytes uncompressed; Vite reports 138.34 kB gzip. CSS: 58.99 kB / 12.76 kB gzip. These are build sizes, not measured network transfer or execution time. |
| Game chunks | Separate screen chunks from about 5.00–46.56 kB uncompressed. Game UI is lazy, but SW installation downloads these assets for offline use. |
| Precache | 236 entries / 5,318.97 KiB reported by Workbox (about 5.2 MiB). Emitted SVGs account for about 2.62 MB of flags and 2.14 MB of cards. This is an inventory, not measured compressed transfer/storage use. |
| Local HTTP probe | Temporary Vite preview, plain fetch without browser/SW: `/`, `/games/solitaire/`, `/games/flags/`, `/not-a-real-page/`, `/robots.txt`, `/sitemap.xml` each returned status 200, `text/html`, the same 952-byte empty-root document (SHA-256 prefix `a0e6a34097bf`). Server closed after probing. |

The probe verifies Vite preview's fallback only, **not Cloudflare's live response**. Initial cross-process localhost requests failed under environment isolation; the successful probe started preview and fetched within one process. No browser interaction or JavaScript rendering was exercised.

## Alternatives

Scores are design judgments, not benchmark results. 5 is best; complexity means least work, and regression safety means lowest risk.

| Approach | Low complexity | SEO HTML | Performance potential | Maintainability here | Regression safety | Assessment |
| --- | --- | --- | --- | --- | --- | --- |
| **Vite prerendered public shell + existing React runtime** | 4 | 5 | 4 | 4 | 4 | Recommended. One small static renderer, shared content and existing game/runtime code. Main costs are hydration boundary, route changes and build/SW ordering. |
| Vite multipage documents, normal full-page navigation | 3 | 5 | 4 | 3 | 3 | Feasible, but manual HTML copies drift; shared generation is still needed. Repeated app startup and document teardown introduce pending-save/focus/settings risks. Little benefit over progressive links with one client controller. |
| Astro static pages + React game components | 2 | 5 | 5 | 3 | 2 | Strong long-term editorial platform. Requires Astro/React integration, routing/build changes and PWA integration validation. Existing contexts, browser-only App and navigation still need separation. Disproportionate for nine public pages today; revisit only if M22's publishing workload justifies a separately approved migration. |
| Path-aware SPA + metadata/sitemap only | 5 | 2 | 3 | 4 | 4 | Smallest code delta, but leaves useful content dependent on rendering JS and does not satisfy first-response HTML acceptance. Necessary route work, insufficient final solution. |
| Browser-snapshot prerender of the whole app | 2 | 4 | 3 | 2 | 2 | Browser/build dependency, random boards and state/timing hazards; snapshots of saves/settings/account UI must be excluded. More fragile than rendering deterministic public content. |

[Vite supports prerendering known routes](https://vite.dev/guide/ssr#pre-rendering-ssg) through its existing build APIs, though its SSR APIs are low-level and need owned build code. Astro's [React integration](https://docs.astro.build/en/guides/integrations-guide/react/) and [client-only directive](https://docs.astro.build/en/reference/directives-reference/#clientonly) can preserve browser-only games, but do not remove the app/PWA integration work. These are supported capabilities; the comparative scores are specific inferences for ZenPlay.

## Public URL and indexing contract

Use HTTPS on the existing documented origin, lowercase paths, hyphenated IDs and **trailing slashes**. Retain registry IDs; changing the display name does not rename a save or path. Confirm the canonical production origin before release; do not move the domain as part of M20.

| Game ID | Public canonical path | Proposed title and page H1 |
| --- | --- | --- |
| `solitaire` | `/games/solitaire/` | Title: Free Solitaire, No Adverts — ZenPlay; H1: Solitaire |
| `sudoku` | `/games/sudoku/` | Title: Free Sudoku, No Adverts — ZenPlay; H1: Sudoku |
| `pairs` | `/games/pairs/` | Title: Free Pairs Matching Game — ZenPlay; H1: Pairs |
| `word-search` | `/games/word-search/` | Title: Free Word Search, No Adverts — ZenPlay; H1: Word Search |
| `noughts-crosses` | `/games/noughts-crosses/` | Title: Free Noughts & Crosses — ZenPlay; H1: Noughts & Crosses |
| `fifteen` | `/games/fifteen/` | Title: Free Fifteen Puzzle — ZenPlay; H1: Fifteen Puzzle |
| `mahjong` | `/games/mahjong/` | Title: Free Mahjong Solitaire, No Adverts — ZenPlay; H1: Mahjong Solitaire |
| `flags` | `/games/flags/` | Title: Free Flags Quiz — ZenPlay; H1: Flags Quiz |

`/` remains the game library and PWA launch page. Initial sitemap: **nine canonical URLs**, homepage plus eight games. No separate `/play/` duplicates, `/games/` hub, random-seed, difficulty, theme, statistics, account or puzzle-instance pages are needed.

Give existing utility screens explicit refreshable paths: `/settings/`, `/profile/`, `/support/`, `/install/`. Generate neutral static utility shells with `noindex,follow`, exclude them from sitemap, and hydrate the existing panels. Support remains explicitly fictional with no purchase functionality. Install guidance can become indexable later if it becomes a useful standalone page; that change requires intentional content review. Missing/unknown paths receive a real HTTP 404, useful Home links and `noindex`, with no homepage/game canonical.

### Navigation and legacy compatibility

1. Pathname is authoritative for new navigation, initial load, refresh and `popstate`. Centralize path-to-screen and screen-to-path functions; reject unknown games. Route metadata/static content and the visible game must always agree. Queries/fragments never select another game or serialize a save.
2. Replace game-card/open/Continue navigation with `<a href>` destinations. Intercept only unmodified primary same-origin clicks to known routes; preserve modifier/middle clicks, new tabs, download/external links, fragments and normal fallback. Continue links to the same game path and invokes existing restoration; it never means New game.
3. Keep one shared React navigation controller, not a second independent SEO router. Update path, shell, title/meta/canonical/JSON-LD and runtime together; restore heading focus and appropriate scroll on route changes. Preserve unrelated history-state keys.
4. Visible **Back to Games** explicitly navigates to `/`, including direct entry from a search engine. Browser Back/Forward retains native history behavior; Support's contextual Back may use a validated in-app predecessor, otherwise `/profile/`. Avoid synthetic Home entries on every direct landing.
5. One-time compatibility: on `/` only, a valid **legacy, unversioned** `zenplayNavigation` for a game/utility may be mapped with `replaceState` to its new path. Add a navigation-state version marker for new entries. New explicit paths always win over contradictory/stale state; malformed old state falls back safely. An old Home entry at `/` stays Home. Older installed clients can keep the old bundle until the user accepts an update.
6. Existing shared/bookmarked `/` links remain the library; they never contained a game identity that a server could redirect. No hash/query route was found, so do not invent migrations for one. Known no-slash registry targets are aliases, not established indexable legacy game pages.
7. Generate explicit eight no-slash game-path 301 redirects to their slash paths, plus utility aliases as needed. Prefer platform normalization for `/games/{id}/index.html`; verify it and add only necessary exact aliases. Never use a wildcard `/* /index.html 200`, redirect unknown games to Home, or add an untested slash wildcard that loops on assets.
8. Tracking/irrelevant query strings do not create new content: use the query-free page canonical, no query links/sitemap entries, and no infinite variants. Keep same-page fragments for rules/game navigation. No domain/HTTP/www redirect changes in M20A; inspect existing platform rules before planning release changes.

## Static content, rendering and game integration

### Shared content boundary

Create one small, browser-independent catalogue keyed by existing game IDs with canonical path, display name, title, description, introduction, reviewed rules/controls and related links. Move only the static registry fields needed by the shell into this catalogue; the runtime registry can attach its existing Continue loaders. This prevents public rendering from importing save loaders or account code. Avoid creating a parallel hand-maintained list of games for sitemap generation.

Render a pure React public shell at build time using `react-dom/server` already available in the project. It must not import `App.tsx`, `virtual:pwa-register`, `AccessibilityProvider`, browser account clients or game screens. Reuse presentational components/styles where safe. No storage access, random deals, dates, network calls or private data during rendering.

Each game document contains, in this order:

1. Skip link, visible Home/library link, one H1 and a short unique introduction identifying the actual game/variant.
2. Accessible, labelled game region immediately near the top. Static output includes a stable loading placeholder and a no-JS message explaining that play needs JavaScript; it must not show a fake interactive board or require a second Play click.
3. Concise, visible rules and controls below the playable region, then a small set of relevant game/guide links. A `#how-to-play` link can reach the rules without opening a modal.

Useful content is visible with JS disabled and retained after game mounting. The game itself remains interactive JS, not prerendered gameplay. Do not bury the board under an SEO essay, replace current game controls, or add word-count targets. Hand-review eight short pages against implemented rules: Klondike for Solitaire, tile-matching Mahjong Solitaire rather than four-player Mahjong, and the existing Flags modes. Noughts & Crosses may explain the familiar “tic-tac-toe” name naturally.

Prefer one source for shared rules text used by the static page and existing in-game help; preserve accessible modal controls and game-specific details. M22 adds original worked guides later, not bulk content in M20B.

### Client boundary and accessibility

Use `hydrateRoot` only for the shell rendered by React on the server, with the same initial route/data and deterministic placeholder. [React requires matching initial markup](https://react.dev/reference/react-dom/client/hydrateRoot). After hydration, a client boundary loads the existing runtime, provider and selected lazy game. Browser-only state must not influence the first hydration render. Dev mode may use `createRoot` when serving an empty template; never call it over prerendered production markup.

Retain the existing AccessibilityProvider's storage/load semantics inside that client boundary. Do not render default settings and persist them over an existing preference while waiting to read storage. Global theme, high contrast, Simple Mode, scale and reduced-motion classes must style the public shell as well as the game once loaded. The static shell must also respect system reduced motion/contrast and remain readable before JS. Treat preference flashes/board shifts as acceptance issues; a minimal storage-read-only early theme bootstrap is an option only if the prototype shows a regression.

Reuse GameShell, game controls, announcements, save warnings and error handling. Integrate its heading with the page heading rather than leaving two H1s or nested main landmarks. Reserve reasonable space for loading without imposing a fixed board size that breaks large pieces/zoom. Do not remount the game for a metadata-only or same-page fragment change. Preserve keyboard/touch behavior and focus on the new screen heading for in-app route changes; avoid stealing focus on initial page load or every asynchronous game update.

### Build contract

Keep `npm run build` as the deployment entrypoint and `dist/` as final output. Proposed sequence:

1. Typecheck; compile an isolated static renderer with the existing Vite SSR build API into temporary build output outside the deploy directory. PWA generation is disabled for this renderer build only.
2. Build browser assets with Vite and emit the public/utility documents using the renderer and the final hashed asset references. Generate sitemap, robots, redirects and top-level 404. Preserve Vite-generated manifest/style/script injection, escaping and root-absolute asset URLs.
3. **Generate the service worker after every deployable HTML file is final.** Prefer a small Vite emission hook before the existing PWA close-build generation, avoiding manual HTML copies or a new SSG framework. If orchestration uses the plugin API, ensure it generates once after prerendering. The installed plugin exposes `generateSW`; exact hook integration is an M20B prototype task, not a claim of tested integration.
4. Validate output, HTML revisions and precache coverage; exclude temporary SSR artifacts from `dist` and fail the build on missing routes/assets or invalid catalogue data. Do not mutate HTML after Workbox hashes it.

Required output includes `dist/index.html`, eight `dist/games/{id}/index.html`, four utility `index.html` files, `dist/404.html`, `robots.txt`, `sitemap.xml`, optional generated `_redirects`/`_headers`, existing manifest/SW/icons and hashed assets. Update `dev` handling to serve/resolve known paths using the same route rules; preview and development convenience fallbacks are not proof of deployed HTTP statuses.

## Metadata and structured data

- Generate title, unique description and one absolute self-canonical in each public HTML head. For example, Solitaire's description should identify Klondike, tap/keyboard controls and local resume, not promise unimplemented variants or claim all settings are equally supported in every game. Keep canonical origin in one explicit build configuration value, defaulting to the documented origin for review; never derive it from an arbitrary request Host.
- Include `og:type=website`, title, description, canonical `og:url`, absolute image URL, image dimensions/alt text and matching `twitter:card=summary_large_image`. Use an existing-brand-derived, reviewed static social image; game-specific images only if useful and inexpensive. No remote font/image dependency is needed, and no fabricated screenshot/testimonial.
- Maintain existing language, viewport/zoom, theme-color, icons and PWA head tags. Serialize/escape catalogue text and JSON-LD safely, including literal `<` in script data; never interpolate profile/user values.
- Homepage: `WebSite` and a `CollectionPage`/`ItemList` of the eight linked games. Game pages: `WebPage` with `mainEntity` pointing to a [Schema.org `VideoGame`](https://schema.org/VideoGame), plus `BreadcrumbList` for visible Home → game breadcrumbs. Use stable canonical-derived `@id`, `name`, `url`, description, `inLanguage`, `isAccessibleForFree: true` and truthful browser platform/category information.
- Validate vocabulary and required fields for any claimed search feature separately. Schema.org validity does not guarantee Google rich results or rankings. Do not invent aggregate ratings, reviews, prices, medical benefits, achievements, public profiles or paywall data. No FAQ/HowTo markup merely to pursue rich results; add Article/guide markup later only when it describes real visible editorial content.
- Generate sitemap from published, indexable catalogue entries; absolute canonical URLs only. Omit `lastmod` unless grounded in actual meaningful content changes. Generate production robots allowing public pages/assets and referencing that sitemap. Utility `noindex` must be present in delivered HTML (and may be reinforced by headers); do not block crawling those pages in robots and thereby hide the directive. Robots/noindex is not authorization or privacy protection.
- Preview/local builds must be non-indexable independently of canonicals. For later authorized Pages previews, verify the [platform's default `X-Robots-Tag: noindex`](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-indexing-by-search-engines); ensure an environment-specific header or build directive covers any custom preview hostname. Do not accidentally ship a preview noindex to production. Production canonicals in previews alone are insufficient protection.

## Internal linking and future guides

Homepage contains real links to all eight games. Each game has Home, rules anchor and a few relevant game links, available in initial HTML. Keep Settings/Profile/Install accessible in predictable locations without making account connection a step before play. Do not expose Continue/private profile details in build output.

Reserve `/guides/`, `/guides/{game-id}/` and `/guides/{game-id}/{topic}/` for M22: a useful guide index, a game-specific guide hub when enough material exists, and original articles such as `/guides/solitaire/how-to-play/`. Guide pages link to their game; game pages link back to published useful guides. Do not generate empty hubs, link to unbuilt guides, duplicate game rules as thin articles, or publish permutations by difficulty/region/seed. Add reviewed content to the same static pipeline/sitemap only when ready. Markdown can be considered then; a CMS/MDX dependency is unnecessary for M20B.

## Cloudflare Pages and redirects

The recommendation fits static Pages output: [Pages matches static HTML paths and normalizes directory index URLs](https://developers.cloudflare.com/pages/configuration/serving-pages/). Its documented default is to serve root HTML for unmatched paths when no top-level 404 exists. Ship a top-level `404.html` to opt out of that SPA fallback and emit all supported utility routes explicitly. No Worker, SSR adapter, functions or speculative Wrangler configuration is needed.

Use generated, exact aliases only where needed. [Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/) run even when an asset exists, so test precedence/loops; use explicit permanent status, never the default temporary status accidentally. Domain-level redirect policy is a separate hosted setting to inspect, not something `_redirects` can be assumed to reproduce.

Before any later deployment, owner/authorized operator must verify Pages project identity, Git/deploy trigger and production branch, Node/build/output settings, public Supabase values, existing redirect/header/cache rules, domain/HTTPS binding and preview noindex. Test final status/Location/content-type/HTML at all nine public paths and aliases using a Pages-compatible local runner or separately authorized preview. Vite preview does not emulate Pages redirects/404 semantics. There was no hosted verification or deployment in M20A.

## PWA, offline and data compatibility

1. Keep manifest identity/start/scope `/`, prompt updates, existing root SW URL/scope and optional install flow. Do not create a second PWA under `/games/`. Use root-absolute resource URLs on nested pages; verify installed launch from both Home and a direct game landing.
2. Continue with `generateSW`. Precache final homepage, eight game documents, utility shells, all existing game chunks and essential local game art/CSS/icons. Keep all eight games playable after offline readiness even if only Home was visited online; lazy execution is compatible with eager offline asset downloads. Do not replace this promise with visited-games-only caching to improve a metric.
3. Remove the global `navigateFallback: 'index.html'` for the static-page design. Let [Workbox's precache routing](https://developer.chrome.com/docs/workbox/modules/workbox-precaching) resolve canonical slash paths to their own `index.html`. Cover known no-slash offline aliases through explicit cache URL mapping/known-route handling if needed; directory-index matching alone only covers slash paths. Test every route instead of assuming a Pages redirect can run offline.
4. Public page responses do not vary by query. Align Workbox's parameter matching with the route contract so query-bearing known-page navigations still resolve offline; its defaults ignore only selected tracking parameters. Any broader query normalization must stay scoped to these static pages/assets, never arbitrary account/API requests. Unknown offline paths may show the browser's unavailable page initially; do not mislabel them as Home or another game. A custom offline not-found response is optional, not a reason to add a custom worker now.
5. SW caches only public static resources. Do not cache Supabase Auth/PostgREST/function responses, email codes, private profiles or sessions; no broad runtime caching rule. No offline account requirement and no cloud saves are introduced.
6. Preserve `zenplay-local`, both stores, versions, all eight IDs, existing serializers, legacy-save recovery, `zenplay-settings`, local profile and Supabase browser session configuration. Paths on the **same origin** share storage; host/protocol changes do not. Existing origin continuity is a release requirement, not a data migration shortcut.
7. Existing SW-controlled clients can serve the old shell until update acceptance. Test old worker → waiting new worker → user-approved update on Home, and Back/Forward entries from before the update. No automatic reload mid-game, forced unregister, cache/site-data wipe or storage reset. Cache cleanup must not touch IndexedDB/localStorage.
8. Retain in-document navigation while existing write queues settle. Regression tests must exercise rapid game moves followed by Home/Continue/reload; if a pending-write race is demonstrated, add the smallest lifecycle/flush guard without altering the save format. Do not rely solely on unload events.

## Mobile performance contract

Serve useful text immediately, mount the chosen game promptly, preserve split screen chunks and avoid loading every game into the execution path for prerendering. Hydration is for the public shell; randomly generated/dealt boards must not enter HTML. Reserve adaptable loading space, avoid decorative hero media above play, keep local assets and do not add analytics/ads/third-party scripts.

Measure before optimizing the current main chunk; profile/support imports and registry save imports are candidates, not proven CPU bottlenecks. Preserve current offline asset coverage. Exclude any new social-card-only large raster assets from precache unless needed offline; do not silently increase installation cost with every editorial image.

M20B acceptance: compare identical cold/warm mobile runs, same device/network/browser and configured/unconfigured account build. Record requested/executed JS separately from background SW downloads; record build gzip totals and precache entry/byte totals. Investigate any material regression rather than accepting an arbitrary new library budget. Target [Core Web Vitals](https://web.dev/articles/vitals) of LCP ≤2.5 s, INP ≤200 ms and CLS ≤0.1 at the 75th percentile, segmented by mobile/desktop, as eventual field goals, not baseline measurements or guaranteed outcomes; use lab LCP/CLS and interaction traces during local review, then field data only after an authorized release. Record the test setup and repeat enough runs to distinguish noise.

## M20B implementation order and review gates

| Order | Scoped work and likely files | Gate before continuing |
| --- | --- | --- |
| 0 | Review this decision, confirm origin/URL policy and scope. Record remote unknowns without changing them. | Architecture accepted; no implied migration/deployment approval. |
| 1 | Shared static catalogue; extend `src/app/navigation.ts` and tests for paths, utility screens, aliases, versioned/legacy state and unknown routes. Keep IDs/save modules untouched. | URL round trips and legacy precedence tests pass. |
| 2 | One vertical slice: Home + Solitaire public shell/isolated renderer, `src/main.tsx` hydration boundary and route-aware `App.tsx`; reuse `GameCard`/`GameShell` with anchors and one heading. Integrate build orchestration in `vite.config.ts`/`package.json`. | JS-disabled HTML, correct live game, preference restoration, no hydration warnings, lazy loading and immediate play verified locally. Reassess if the boundary requires a broad App rewrite. |
| 3 | Prove final-HTML-before-SW ordering and exact offline document resolution using the slice; preserve update prompts/manifest identity. | Generated revisions match final files; direct offline slice entry and old→new worker update test pass. |
| 4 | Extend catalogue/output to all eight games and four utility shells; metadata/JSON-LD, useful short content, social image, sitemap/robots/404 and exact redirect aliases. | Automated content/link/indexing checks pass for the complete route set. |
| 5 | Full built-app regression and Pages-compatible HTTP validation; update existing infrastructure docs for actual proposed build changes. | Automated matrix passes; unresolved manual checks clearly recorded. No deployment bundled into this step. |
| 6 | M20C real-device/accessibility review and separately authorized hosted acceptance/Search Console setup. | Owner reviews evidence and explicitly authorizes any production release. |

Names of new catalogue/shell/render files are implementation choices; keep modules small and reuse existing patterns. No new runtime package is expected. Browser automation may reuse the existing disposable Chromium/CDP verification approach; add a test dependency only if an evidenced gap justifies review, not automatically for SEO.

## Acceptance tests to add/run in M20B and M20C

These are requirements, **not tests completed by M20A**.

| Layer | Automated acceptance |
| --- | --- |
| Route model | All eight game IDs and utilities round-trip; slash/no-slash policies; pathname wins over conflicting history; legacy `/` state upgraded once; malformed/foreign states safe; unrelated state retained; unknown/malformed/encoded paths not treated as valid games. Queries/fragments cannot change game ID. |
| Built HTML | Plain response/file parsing finds unique title/description, one H1/main, meaningful game-specific intro/rules, game region/no-JS text, crawlable links, absolute self-canonical, social fields and parseable escaped JSON-LD. Static/client content agrees. No private/profile/save/random board output; no unresolved source paths. |
| Discovery | Exactly nine initial sitemap URLs, all indexable canonical pages, no utility/404/query/redirect entries; links/assets resolve. Correct robots MIME/content/sitemap origin. Utility/404 noindex present before JS; production no accidental noindex; preview noindex independently verified. No generated guide placeholders. |
| HTTP | Pages-compatible fresh requests without SW/JS: nine paths 200 with distinct intended HTML, aliases permanent redirect to final slash path without loops/chains, utility paths load their shell, unknown game/arbitrary path 404. Check content types, canonical host policy and headers. Vite preview alone cannot satisfy this row. |
| Browser navigation | Direct entry, refresh, copied URL/new tab, modified click, library → game → Home, Continue, utilities, Back/Forward and missing paths. Correct path/game/head after each transition. Back to Games from external referrer goes Home; browser Back can return to referrer. Initial history does not force a new game or capture focus unexpectedly. No hydration/console/chunk errors. |
| Saves/settings | Seed valid pre-M20 saves/statistics for all six resumable games and preferences/local profile, then navigate/resume/reload/update. Compare state and IDs; counts not duplicated. Test malformed saves/storage denial using existing safeguards. Rapid moves + navigation retain latest completed write. Noughts & Crosses/Flags gain no invented save behavior. |
| Accounts | Unconfigured, signed-out and configured session cases with stubbed/nonproduction service; session survives path/reload, OTP/profile/delete-local-separation behavior unchanged, offline accounts unavailable without blocking play. No private requests intercepted by SW caches. Production disposable-account checks only with separate authorization. |
| SW/install/update | Build asserts all final HTML/chunks/art are precached and revisions match file content. In isolated browser profile visit only Home, await offline readiness, go offline and enter/reload every game/utility including known alias/query forms. Play all eight, restore supported saves. Test a prior-build active game + new waiting worker; update waits, Later works, accepted update keeps local data. |
| Baseline checks | `npm test`, `npm run typecheck`, `npm run lint`, `npm run build`, output validations and `git diff --check`. Include the route/browser/SW regression harness; current unit tests alone do not cover the new architecture. |

Manual M20C acceptance:

- Keyboard-only navigation and actual play in all games; predictable focus order, route heading focus, rules links/dialog return focus, no trapped/hidden controls, same-page anchors usable.
- Screen-reader checks with Windows NVDA and iOS VoiceOver (or recorded equivalent coverage): page titles/headings/landmarks, game-region loading, announcements, Back/Continue and account dialogs. Automated accessibility scans supplement, not replace, these checks.
- 320/360/390 CSS-pixel mobile widths, desktop/tablet and portrait/landscape; 200/300/400% zoom, extra-large text, large pieces, high contrast, Simple Mode, system/app reduced motion and light/dark/system themes. Preserve board usability and prior tap/drag fixes.
- Physical Android Chrome and iPhone/iPad Safari/Home Screen: install from Home and game entry, launch identity, offline after Home-only readiness, all games, interrupted/partial first cache, low storage, return after suspension and explicit update. First-ever offline load is not promised; cache eviction can require reloading online.
- Cold/warm mobile performance and layout-shift review using the recorded baseline methodology. No board pushed far below marketing/rules, accessibility-size layout regressions or blocking account requests.
- After a separately authorized release only: confirm production/preview robots and status codes, inspect Google URL rendering/canonical selection, submit sitemap to Search Console/Bing and monitor indexing/CWV. Static build success does not prove indexing, rankings or traffic.

## Risks and unresolved decisions

| Risk/unknown | Mitigation / decision required |
| --- | --- |
| Shell hydration imports browser code or loses preferences | Isolate pure imports; prototype one game; matching initial markup; provider initializes from storage only on client; never save defaults before restoration. Stop and review if separation expands into a rewrite. |
| Prerender runs after SW hashing | Enforce build order; compare emitted HTML hashes/revisions and cache contents. Fail build instead of shipping stale or absent game pages. |
| Old state/SW masks new URLs or heads | Version navigation state, narrowly migrate legacy root entries, prefer paths, test old→new worker lifecycle and do not force updates. |
| Mobile cost grows with useful HTML/art | Preserve lazy games; measure main chunk/interaction and precache separately; avoid new decorative payload and unnecessary packages. Existing 5.2 MiB offline inventory is a baseline, not a target to increase or silently reduce. |
| Save queues/document transitions race | Prefer progressive in-document routing; test rapid actions/navigation and persistence completion. No format/database changes. |
| Hosted settings differ from documents | Owner/authorized operator must verify actual origin, Pages project/branch/deploy trigger, redirects, headers, preview policy and Node/build settings before release. No remote state assumed. |
| Public content misstates features | Review eight descriptions/rules/social images against current games. Specifically distinguish Mahjong Solitaire and six-game resume scope; preserve optional-account wording. |
| Schema mistaken for guaranteed search enhancement | Use honest vocabulary, validate markup, make no rich-result/indexing/ranking promises. Search Console baseline remains unknown. |
| Canonical host/URL policy not yet approved | Recommendation is the existing `https://playadfree.games` origin and listed slash URLs. Review before implementation; no domain move or storage migration. |
| Utility indexing/editorial expansion | Recommend utility noindex for M20B; revisit Install and guides only when standalone editorial value is established. No empty pages for speculative keywords. |

M20A ends with this recommendation and the updated M20 milestone. M20B implementation, new dependencies, hosted changes and production release remain unperformed.
