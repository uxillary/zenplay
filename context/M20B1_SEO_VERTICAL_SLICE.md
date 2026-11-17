# M20B.1 — Home and Solitaire SEO vertical slice

Date: 2026-11-17

Status: **IMPLEMENTED — LOCAL ACCEPTANCE PASSED — NOT DEPLOYED**

## Scope and result

Implemented the approved M20A architecture for `/` and `/games/solitaire/` on `codex/m20b1-seo-vertical-slice`, based on current `main` at `abd855d`. Main matched fetched `origin/main` before branch creation; the starting working tree was clean. The original planning branch was not merged or used to overwrite the M20A documents.

Both public URLs now return meaningful, distinct prerendered HTML, with their own title, description, canonical and one H1/main. Solitaire includes a short Klondike introduction, rules/controls, Home links, a labelled loading region and a no-JavaScript explanation. The existing game starts automatically after hydration, near the top of the page. No board, random deal, settings, save, account or profile is rendered at build time.

The seven other games remain playable using their existing root history-state navigation. No public routes/documents were added for them or for utility panels. No eight-game sitemap, robots release policy, social assets, JSON-LD, guides, analytics or payment functionality was added. This is an implementation slice for review, not the complete SEO release.

## Architecture actually implemented

1. `gameCatalogue.ts` holds public game summaries; the runtime registry attaches the existing Continue loaders. Static rendering does not import the runtime registry, providers, Supabase client or game engines. Existing Flags copy is reused through its browser-independent definition; its type import now points to the public summary type.
2. `PublicShell.tsx` supplies shared frame/library/Solitaire content, reusing GameCard/GameShell and existing styling. Game cards and Continue use real anchors for Solitaire. Other games keep their current buttons until their public documents exist. The skip link works without discarding same-URL screens.
3. `npm run build` runs `tsc -b`, compiles the isolated renderer to ignored **non-deployed** `dist-ssr/`, then builds browser assets. There is no runtime SSR process or framework migration and no package was added.
4. `seoPrerender.ts` runs in Vite's `writeBundle` hook, after hashed asset/template output. It writes final Home, Solitaire and 404 documents plus an exact Solitaire alias redirect. Workbox generates its revisions afterward in the PWA plugin's `closeBundle`. The build verifier compares HTML MD5 hashes against the emitted Workbox revisions.
5. `src/main.tsx` hydrates the document's declared public shell. `Bootstrap.tsx` initially renders that same deterministic shell, then imports/mounts the existing browser App after hydration. The App reuses the same presentational components; the initial static component tree is replaced once by the runtime tree. It is not a separate persistent island/router system. Browser preferences and legacy history affect only that mounted runtime, preventing hydration mismatches or writes of server defaults over stored preferences.
6. The existing Solitaire screen remains a separate lazy import with its current loading/error handling. Its engine, card/gesture components and accessibility preference formats are unchanged.

### Files changed

| Files | Purpose |
| --- | --- |
| `src/app/gameCatalogue.ts`, `gameRegistry.ts`, `src/games/flags/game.ts` | Separate deterministic public summaries from persistence callbacks; preserve existing game IDs/text. |
| `src/app/navigation.ts`, `navigation.test.ts`, `App.tsx` | Public path resolution, legacy compatibility, explicit Home, synchronized live metadata and shared page composition. |
| `src/components/GameCard.tsx`, `GameShell.tsx` | Progressive Solitaire/Continue/Home anchors with native modified-click behavior. |
| `src/seo/PublicShell.tsx`, `publicContent.ts`, `Bootstrap.tsx`, `metadata.ts`, `render.tsx` | Shared content, deterministic rendering, browser boundary and route-specific metadata. |
| `src/main.tsx`, `index.html` | Hydration entry, document marker and no-JavaScript explanation. |
| `scripts/seoPrerender.ts`, `vite.config.ts`, `package.json`, `tsconfig.node.json`, `eslint.config.js` | Build sequencing, isolated TSX renderer support, local route handling, PWA configuration and verification commands. |
| `src/games/solitaire/save.ts`, `ui/SolitaireScreen.tsx`, `save.test.ts` | Pending-write read barrier; no schema, serializer, database or game rule change. |
| `src/seo/render.test.ts`, `scripts/verify-seo-build.mjs`, `verify-seo-browser.mjs` | Static/hydration equivalence, built HTML/precache/HTTP and disposable-browser acceptance. |
| This document, M20 milestone, infrastructure README/services | Actual progress, reproducible build/test workflow and remaining release checks. |

## Routing and hydration behavior

- Canonical public paths: `/` and `/games/solitaire/`. Known `/games/solitaire` and directory-index aliases resolve to Solitaire; local dev/preview issue permanent redirects while retaining query strings. Build output includes the exact no-slash Pages redirect; Pages' own index normalization remains a hosted acceptance check.
- Direct Solitaire entry always wins over conflicting history state. A valid unversioned legacy Solitaire entry at `/` is upgraded with `replaceState` to the Solitaire path, preserving unrelated history keys. New entries carry version 1. A fresh Home entry cannot be replaced by stale versioned Solitaire state.
- Unsliced games/settings/profile/support/install retain validated root history entries, including refresh and Back/Forward. Their live metadata has no public canonical and uses noindex. They have not acquired new SEO URLs.
- Only unmodified primary clicks on the fixed internal anchors are handled in-app. Ctrl/Cmd/Shift/Alt/middle clicks are not cancelled by the app. Before runtime loading or with JS disabled, anchors navigate normally. Explicit Back to Games goes to `/` without relying on an external referrer being part of in-app history.
- URL, game, visible H1 and live title/description/canonical/robots are updated together. Existing screen-heading focus behavior remains for route changes; same-game fragments do not remount the game. The skip link focuses the main landmark without creating a state-less root history entry.
- Unknown paths are not interpreted as Home or a valid game. Vite uses multipage mode without its SPA fallback; generated `404.html` provides a noindex not-found document for Pages. Vite's default unknown-path 404 body differs from the intended Pages custom 404 body, but the local status/absence of game content is verified.

## Static HTML and HTTP evidence

`npm run verify:seo` inspected final files and started/closed a temporary localhost Vite preview. Plain fetch requests used no browser or service worker:

| Request | Local result |
| --- | --- |
| `/` | 200 HTML, 6,308 bytes; library content and crawlable Solitaire link. |
| `/games/solitaire/` | 200 HTML, 4,018 bytes; unique Solitaire metadata, introduction, rules/controls, loading region and library links. |
| `/games/solitaire` and `/games/solitaire/index.html`, with test query | 301 to `/games/solitaire/`, query retained. |
| `/games/missing/`, `/not-a-page/`, `/games/sudoku/` | 404; no silent homepage/game fallback. Sudoku remains available through the existing library button, not a new public URL. |
| `/robots.txt`, `/sitemap.xml` | 404. Final discovery files deliberately await the full catalogue/release policy. |

Automated checks require exactly one title/description/canonical on each public page, one H1/main, distinct metadata, useful static content, no fake board/private state, correct root-absolute assets and deterministic output. The noindex 404 has no game/home canonical. Renderer output and Bootstrap's first render match exactly in Node without browser globals. Headless browser tests also loaded both pages with JS disabled and read the useful text/links and no-JS message.

**These are local Vite/file checks. No Cloudflare project, redirect precedence, hosted header, deployment, canonical domain binding or live indexing was inspected or changed.**

## Saves, preferences and account compatibility

The browser test seeded a valid pre-M20 Solitaire save (schema 1, existing game ID), statistics, settings and private local profile in a disposable profile. Direct entry, refresh, Home/Continue and worker updates retained the session, game position, statistics and preferences. High contrast, large pieces/text and reduced-motion classes were restored. The production IndexedDB name/stores, game IDs, settings/profile versions and serializers were not changed.

The acceptance prototype found a real pending-write race: Home → Continue could read a prior snapshot while the old screen's queue later persisted the newer snapshot. The database could then be newer than the resumed visible board. Solitaire now registers its existing queue with its save module; save/Continue readers await that queue before reading. A failed write does not permanently block readers. The browser regression delays write-completion notifications, makes two stock moves, immediately navigates Home/Continue, and verifies **both** the live board and save contain both moves without increasing the seeded statistics.

This barrier covers in-document queued-write restoration. It does not promise durability if the tab/process is abruptly terminated before a write begins, or resolve simultaneous editing in multiple tabs. Normal browser refresh was tested after persistence, not forced process termination during writes.

Supabase configuration/client/auth code is unchanged and remains outside the static renderer and SW runtime caching. Existing account unit tests passed. No live email OTP, remote profile mutation or hosted deletion was performed; no real account was used by the browser tests.

## PWA and offline findings

- Manifest `id`, `scope`, `start_url` remain `/`; existing icons/assets, prompt registration, `skipWaiting: false`, `clientsClaim: false` and user-chosen updates remain.
- The broad `index.html` navigation fallback is removed. Canonical slash paths resolve to their own precached documents via Workbox directory indexes. An exact same-origin navigation-only NetworkOnly rule gives known Solitaire aliases their precached document if offline. Public precache matches ignore query parameters; this does not cache unrelated API/private responses.
- Final Home, Solitaire and 404 Workbox revisions match final file hashes. All eight lazy game screen chunks and existing local game art remain precached. No eight-game HTML catalogue or wildcard catch-all was generated.
- The browser test unregistered worker/cache data **only in its disposable fixture profile**, retained local saves/settings, then revisited only Home online to repopulate offline resources. It then loaded/reloaded Home and Solitaire offline, including direct game and query/no-slash alias navigation. The correct game content and saved session remained available.
- A local HTTP fixture served the same worker with a changed version comment to test the update lifecycle. The new worker waited during active play, no update button/reload interrupted the game, Home offered Update now/Later, Later kept it waiting, and explicit Update now reloaded while preserving local data. This proves the local prompt/activation path; it does not replace a two-production-build asset-retention test on physical devices.

## Test results and performance comparison

Verified on Windows with Node 24.21.0, npm 11.19.0, Vite 7.3.1 and headless Edge 157.0.4341.60:

| Command/check | Result |
| --- | --- |
| `npm test` | **224 passed**, 0 failed; includes new path/legacy/click/static/hydration/save-queue tests. |
| `npm run typecheck` | Passed; the build also ran project-reference `tsc -b`. |
| `npm run lint` | Passed. |
| `npm run build` | Passed; isolated renderer 8 modules, client 157 modules; no new packages. |
| `npm run verify:seo` | Passed final HTML, HTTP aliases/404s, PWA identity, final precache hashes and retained lazy assets. |
| `npm run test:seo-browser` | Passed JS-disabled pages, real hydration/play, same-document Home/Continue/history, legacy state, modifier cancellation, delayed writes, settings/profile/statistics preservation, unsliced Sudoku/skip-link smoke, emulated touch drag and offline/update matrix. |
| Browser console | No runtime exceptions or console/hydration warnings in the accepted run. |
| Visual inspection | Inspected 390×844 screenshot with large text/pieces, high contrast and reduced motion. Board remains near the top, card presentation is intact, page width stays within viewport. Screenshot is reproducible at ignored `node_modules/.tmp/m20b1-solitaire.png`. |
| `git diff --check` / new-file whitespace/local document links | Passed. |

The browser runner launches a new headless profile under the OS temp directory, closes its browser/server afterward, and leaves uniquely named fixture-only temp profiles unused for OS cleanup. Set `ZENPLAY_TEST_BROWSER` only if the local Chromium/Edge executable differs. It is a **test-runner-only** variable, not a client/deployment setting. Modifier tests verify the app leaves the event uncancelled; physical Ctrl/Cmd/middle-click gestures were not manually tested.

The M20A baseline uses the same application source preceding the documentation-only main commit. Sizes below are emitted files/gzip, not network/CPU/field measurements:

| Measure | M20A baseline | M20B.1 |
| --- | --- | --- |
| Initial HTML | One 952-byte empty-root document | Home 6,308 bytes; Solitaire 4,018 bytes; useful HTML before JS. |
| Main/runtime JS | 474,897 bytes / 138,336 gzip | Bootstrap 204,480 / 64,789 gzip; deferred App 276,693 / 76,020 gzip. Combined 481,173 / 140,809 gzip: about +1.3% raw / +1.8% gzip. |
| Solitaire screen JS | 32,202 / 10,045 gzip | 32,255 / 10,067 gzip; still lazy. |
| CSS (rounded kB) | 58.99 / 12.76 gzip | 59.20 / 12.81 gzip. |
| Workbox inventory | 236 entries / 5,318.97 KiB reported | 239 entries / 5,336.44 KiB reported, approximately +17.47 KiB (+0.33%). |

Vite's normal asset summary reports the pre-hook HTML template size; the verifier measures the **final** HTML above. Bootstrap imports App immediately after hydration, so the split does not imply users avoid downloading the runtime. No Lighthouse/CWV, throttled device timing or before/after interaction benchmark was run; no speed improvement is claimed from splitting alone. Background offline downloads remain distinct from lazy game execution.

## Remaining risks and M20B.2 recommendations

1. **Not release-ready as an eight-game site.** Review this slice before adding the seven other game documents, utility paths and broadening route tests. Keep their existing root flows until each path has real HTML. No public sitemap until the catalogue is ready.
2. **Hosted behavior remains unknown.** Before any separately authorized preview/release, verify actual Pages project/branch/deploy trigger, `npm run build`/`dist`/Node settings, existing redirect/cache/header rules, origin continuity, preview noindex, index normalization and true custom 404 behavior. Never publish `dist-ssr` or add an SPA catch-all. No push/deploy/merge was performed here.
3. **Physical/device accessibility acceptance remains.** Android/iOS installation and Home Screen launch, native browser UI Back, VoiceOver/NVDA, 200–400% zoom, the full 320–430-width matrix, Simple Mode, real touch double-tap/keyboard interactions and interrupted installs/storage eviction were not newly certified. Existing game tests passed and the card/gesture code is unchanged, but emulation is not physical acceptance.
4. **Static shell/runtime boundary.** The small initial shell is hydrated and then mounted within the runtime tree, not retained as a separate framework island. Test focus/layout stability during cold module loading on slow devices before considering a finer-grained boundary. Do not broaden this into an application rewrite.
5. **Rules/content maintenance.** Static Solitaire copy was reviewed against current rules; the in-game modal retains draw-mode-specific guidance. Consider sharing stable rule paragraphs with the modal in M20B.2 without changing controls. Future social metadata/JSON-LD must be truthful and match visible content.
6. **Build entrypoint is intentional.** Use `npm run build`; invoking only the client `vite build` can use a stale/missing isolated renderer. Workbox hashes are verified by `npm run verify:seo`. Retain this check in release validation and consider explicit CI once its actual deployment integration is known.
7. **Other acceptance gaps.** Live Supabase lifecycle, cross-tab saves, full incompatible-asset SW upgrades, preview indexing and Search Console/Bing are not established by this slice. The existing Browserslist age warning remains; no dependency-update work was added.

M20B.2 should extend the accepted catalogue/route pattern, then complete metadata/structured data/social cards, useful reviewed content, utility routing and discovery policy. Keep M20C real-device/hosted review as a separate release gate. No production deployment, payment activation, tracking or new game is included in this work.
