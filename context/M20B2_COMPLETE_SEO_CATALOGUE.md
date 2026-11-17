# M20B.2 — Complete SEO page catalogue

Date: 2026-11-17

Status: **IMPLEMENTED — LOCAL ACCEPTANCE PASSED — M20C RELEASE CHECKS PENDING**

## Implementation summary

Continued on `codex/m20b1-seo-vertical-slice` from the accepted M20B.1 commit `0b869fd`. The starting working tree was clean. No merge, commit, push, production deployment, Cloudflare setting change, payment work, tracking, new game, framework migration or new package was performed.

The existing Vite build-time React renderer now emits Home, eight game documents, four neutral utility shells and a top-level 404. The shared browser shell still hydrates deterministic markup before mounting the existing App and selected lazy screen. No random boards, saves, account information or accessibility preferences are prerendered. Instructions and relevant game links remain below the playable region, with only a short introduction above it. Existing game styling/engines/card components were retained; the CSS output is unchanged from B.1.

The public-content record supplies each game's heading, title, description, introduction, instructions and related links. Copy was checked against actual controls and save support: Mahjong is labelled **Mahjong Solitaire**, its matching/free-tile rules and earned hints are described accurately, and unfinished-game resume is advertised only for the six games that support it. Flags retains its native mode/region setup; no extra SEO Play gate was added.

### Files changed

| Area | Files and purpose |
| --- | --- |
| Shared routes/catalogue | `src/app/gameCatalogue.ts`, `navigation.ts`, `navigation.test.ts`: canonical slash paths, utility routes, exact aliases and legacy state migration. |
| Shared pages/runtime | `src/seo/PublicShell.tsx`, `Bootstrap.tsx`, `src/app/App.tsx`, `index.html`: all game/utility shells, progressive links, loading/no-JS content and existing client boundary. Game error boundaries reset by game ID when using related links. |
| Utility links | `src/components/ProfilePanel.tsx`, `SupporterExperience.tsx`: real Support/Profile links; fictional prototype/payment behavior is unchanged. |
| SEO | `src/seo/publicContent.ts`, `metadata.ts`, `render.tsx`: reviewed content, absolute canonicals, social tags, safely serialized JSON-LD and synchronized live metadata. |
| Discovery/build | `src/seo/discovery.ts`, `scripts/seoPrerender.ts`, `vite.config.ts`: all documents before Workbox hashing, sitemap/robots/redirects/headers, preview policy and exact offline aliases. |
| Persistence | `src/persistence/pendingWrites.ts`, the six resumable games' `save.ts` files, and five additional screen queue registrations: extend B.1's pending-write barrier without changing envelopes, IDs, serializers or database versions. Solitaire keeps its existing exported queue-registration API. |
| Acceptance | `src/seo/render.test.ts`, `discovery.test.ts`, `src/persistence/pendingWrites.test.ts`, `scripts/seoCases.mjs`, `verify-seo-build.mjs`, `verify-seo-browser.mjs`: complete route/content/discovery, queue, browser and offline matrix. |
| Documentation | This report, M20 milestone and infrastructure README/services/verification checklist. M20A and B.1 evidence remain historical records. |

## Verified route matrix

Every row below passed **local** plain HTTP, JavaScript-disabled shell, live hydration, single H1/main and direct refresh checks. Each game also passed Home → game → Home, browser Back/Forward, a real game action, 320/390 CSS-pixel viewport smoke checks and offline direct/reload checks. Utility runtime panels loaded on refresh/offline, rather than remaining at the loading shell.

| Canonical path | H1 | Initial HTTP | Production sitemap | Active-save Continue |
| --- | --- | --- | --- | --- |
| `/` | Choose a game | 200 | Yes | Six supported game links |
| `/games/solitaire/` | Solitaire | 200 | Yes | Yes |
| `/games/sudoku/` | Sudoku | 200 | Yes | Yes |
| `/games/pairs/` | Pairs | 200 | Yes | Yes |
| `/games/word-search/` | Word Search | 200 | Yes | Yes |
| `/games/noughts-crosses/` | Noughts & Crosses | 200 | Yes | No |
| `/games/fifteen/` | Fifteen Puzzle | 200 | Yes | Yes |
| `/games/mahjong/` | Mahjong Solitaire | 200 | Yes | Yes |
| `/games/flags/` | Flags Quiz | 200 | Yes | No |
| `/settings/` | Settings | 200 | No; noindex,follow | — |
| `/profile/` | Profile | 200 | No; noindex,follow | — |
| `/support/` | Support ZenPlay | 200 | No; noindex,follow | — |
| `/install/` | Install ZenPlay | 200 | No; noindex,follow | — |

Exact no-slash and directory-index aliases were tested for all twelve non-root routes, including query preservation. The generated `_redirects` contains twelve exact no-slash 301s; Pages' directory-index normalization still requires hosted confirmation. The runtime normalizes known offline aliases to their canonical paths. There is no SPA catch-all.

Unknown game/nested/case-mixed paths returned an actual local 404. A preview guard prevents Windows' case-insensitive static-file lookup from incorrectly serving a successful game document for mixed-case paths. The emitted `404.html` has one H1/main, no canonical/JSON-LD and noindex; it remains fetchable as a static asset with status 200 so Workbox can install it. Unknown page requests receive it with status 404. This distinction is covered by the HTTP precache-installation test.

### Routing and compatibility

All game/Continue/Home and main utility navigation use real anchors. Only unmodified primary clicks are handled in-app. Modifier/middle-click events remain uncancelled; before hydration, links retain normal document navigation. Browser tests wait for actual runtime controls before asserting in-document navigation.

Explicit game/utility paths override stale history. Valid unversioned root entries migrate with `replaceState`. Version-1 non-Solitaire root entries from the partial B.1 catalogue also migrate; B.1's stale versioned Solitaire/Home protection is retained. New state uses version 2, and unrelated state fields survive migration. No synthetic Home entry is inserted on direct landing. Visible Back to Games always targets `/`; Support's Back to Profile targets `/profile/` safely on direct entry.

Skip links, heading focus and native game keyboard handlers remain. Same-page rule links do not replace the active game. Metadata updates alongside the route include title, description, canonical, social URL/tags and JSON-LD; switching to utilities removes game JSON-LD.

## SEO and discovery validation

- Canonical origin is fixed to `https://playadfree.games`. All thirteen canonical documents have distinct titles/descriptions and absolute self-canonicals. The error document has no canonical. Utility indexing directives exist before JavaScript.
- Open Graph supplies type/site/title/description/URL and an absolute image with dimensions/alt text. Matching social tags use a `summary` card with the existing 512×512 ZenPlay logo. It is an honest brand image, not a fabricated game screenshot; no new raster assets or image-generation dependency were needed.
- Home JSON-LD contains `WebSite` and `CollectionPage`/`ItemList` listing the eight actual game URLs. Game graphs contain `WebSite`, `WebPage`, `VideoGame` and `BreadcrumbList`, with canonical-derived IDs, truthful names/descriptions, browser platform, language and free access. Utilities/404 have no structured data. No ratings, fictional reviews, purchase offers or rich-result claims were introduced.
- JSON-LD is parsed by tests, checked against canonical URLs/item counts, and escapes literal `<` to prevent script-delimiter injection. It is generated entirely from public records, never local/account data. Local validation establishes parseability and the selected vocabulary/relationships, not Google rich-result eligibility or indexing.
- `sitemap.xml` contains **exactly nine distinct production-canonical URLs**: Home plus eight games. No utility, alias, error, query or unbuilt guide URL and no artificial `lastmod` is included.
- Production-policy `robots.txt` permits crawling and references that sitemap. Utility/404 noindex is not hidden behind production robots disallows. XML/plain-text content types and all referenced local icon assets were checked. Sitemap/robots are discovery assets, not private-data access controls.

### Preview-indexing safeguards and required release configuration

Normal local `npm run build` produces the production indexing policy for inspection. Non-production Vite modes or `ZENPLAY_NOINDEX=1` produce noindex HTML, global `_headers` noindex and robots disallow. Local Vite preview always adds `X-Robots-Tag: noindex, follow`; this is separate from production-file meta checks. A document marker prevents client navigation from undoing a build's noindex policy.

Cloudflare builds are **fail-closed**: with `CF_PAGES=1`, indexing is allowed only when `CF_PAGES_BRANCH` exactly matches the explicitly configured `ZENPLAY_PRODUCTION_BRANCH`. If the latter is unset, even the production branch builds noindex. This is intentional because the actual Pages production branch has not been remotely verified. Confirm/configure it before an authorized release, then inspect resulting production headers/meta/robots; do not assume it is `main`.

The system flags are documented in [Cloudflare build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/#environment-variables). Cloudflare also documents a default noindex header for [preview deployments](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-indexing-by-search-engines). Those platform documents were checked; this project's hosted settings/headers were not. For a non-Cloudflare public staging host, explicitly build with `ZENPLAY_NOINDEX=1`. No provider setting was changed here.

## Offline and persistence evidence

Workbox precaches the final fourteen HTML documents (Home, eight games, four utility shells, 404), all eight lazy game chunks and existing local game assets. The verifier compares each HTML file's MD5 to its Workbox revision and fetches the exact document URLs with revision-style queries, ensuring their final bodies are installable. No HTML is changed after hashing.

The existing root SW/manifest identity, prompt registration, `skipWaiting: false`, `clientsClaim: false`, cache cleanup and user-controlled update flow remain. Canonical slash pages use precache directory-index matching. Only exact known static aliases have NetworkOnly rules with a precached-document fallback. No wildcard navigation or API-response cache was added. Public static resources ignore irrelevant query parameters; no new state is encoded into URLs.

In the disposable headless profile, worker/cache files were cleared while fixture local data was retained. The runner visited **only Home online** to establish readiness, then entered/reloaded all eight game and four utility routes offline, plus each no-slash/query alias and Home. Correct runtime content remained available. A private-response fixture was fetched and was absent from CacheStorage; the build inventory/routing contains no Supabase Auth/PostgREST/function URL pattern. This is configuration/fixture evidence, not a live Supabase audit.

Each of the six resumable games received an existing-format schema-1 envelope with a stable fixture session ID and seeded statistics. Real moves changed state, Home/Continue restored it, and refresh/direct entry retained the same session and statistics. Write-completion notifications were deliberately delayed. B.1's queue barrier was extended as a tiny shared per-game helper so reads wait for pending snapshots from an unmounted screen. The storage contract and game logic were not changed. Noughts & Crosses/Flags received no new Continue/save behavior.

The browser also retained large text/pieces, high contrast, reduced motion and the local profile through navigation/offline/update. A version-comment worker fixture waited during play, offered Later/Update now on Home, stayed waiting after Later and reloaded only after explicit Update now while preserving local data. This exercises activation/prompt behavior with the same asset set, not a hosted two-release asset-eviction scenario.

## Tests and performance

Environment: Windows, Node 24.21.0, npm 11.19.0, Vite 7.3.1, PWA plugin 1.2.0, headless Edge 157.0.4341.60. Acceptance uses fresh fixture-only temporary browser profiles, never a personal profile or a real online account.

| Check | Result |
| --- | --- |
| `npm test` | **229 passed**, 0 failures. |
| `npm run typecheck` | Passed; build also ran project-reference `tsc -b`. |
| `npm run lint` | Passed. |
| `npm run build` | Passed; isolated renderer 8 modules, client 158 modules. Existing Browserslist age warning remains. |
| `npm run verify:seo` | Passed all documents, metadata/schema/discovery, 24 non-root alias requests, 404 cases, preview headers, final cache hashes/install responses and eight lazy chunks. |
| `npm run test:seo-browser` | Passed all-page no-JS/hydration, all-game real actions, history/refresh/direct entry, supported saves/Continue, utility transitions, preview marker retention, offline/update and mobile smoke. No runtime exceptions or console/hydration warnings in the accepted run. |
| Automated accessibility smoke | One H1/main, accessible names for visible AX buttons/links, focusable skip link, native keyboard action, 320/390 widths and preserved accessibility settings. This is not a full WCAG certification. |
| Visual inspection | Reviewed mobile Sudoku/Mahjong screenshots with large text/pieces, high contrast and reduced motion. Board presentation is preserved; instructions remain below play. Reproducible ignored screenshots are `node_modules/.tmp/m20b2-{game-id}.png`. |
| `git diff --check` / new-file whitespace / local doc links | Passed. |

Build-size comparison (bytes unless noted; gzip is per-file compression, not measured network transfer):

| Measure | Accepted M20B.1 | M20B.2 |
| --- | --- | --- |
| Home HTML | 6,308 | 9,324 |
| Solitaire HTML | 4,018 | 6,834 |
| Other seven game HTML | Absent | 5,940–6,552 each |
| Four utility shells | Absent | 3,063–3,171 each |
| Bootstrap JS | 204,480 / 64,789 gzip | 214,993 / 68,167 gzip |
| App JS | 276,693 / 76,020 gzip | 277,344 / 76,207 gzip |
| Combined bootstrap/App | 481,173 / 140,809 gzip | 492,337 / 144,374 gzip; +11,164 raw, +3,565 gzip (+2.53% gzip). |
| CSS | 59,198 / 12,812 gzip | Unchanged. |
| Solitaire lazy screen | 32,255 raw | 32,255 raw; game presentation/engine unchanged. |
| Workbox inventory | 239 entries / 5,336.44 KiB | 250 entries / 5,408.09 KiB; +71.65 KiB (+1.34%). |

All game screens remain separate lazy chunks. The additional bootstrap content is short reviewed public copy/metadata and route definitions; App still loads immediately after shell hydration. No third-party scripts, fonts, images or dependencies were added. Workbox totals describe the offline inventory, not download compression, device storage use or JavaScript execution. No Lighthouse, throttled CPU/network comparison or field LCP/INP/CLS measurements were taken, so no speed/ranking improvement is claimed from these sizes alone.

## Remaining M20C release blockers

1. **Hosted identity/indexing review:** confirm Pages project, actual production branch, build/Node/output settings, deploy trigger and domain continuity. Set `ZENPLAY_PRODUCTION_BRANCH` appropriately in the intended build environment, keep staging/preview builds noindex and verify production is not accidentally noindex. No domain change is proposed.
2. **Authorized Pages acceptance:** test live/authorized preview status codes, exact redirects/index normalization, `_headers`, robots/sitemap MIME/content, custom 404s, social assets and canonical host. Local Vite plus official documentation does not certify provider behavior. No deployment/merge is authorized by these results.
3. **Physical accessibility/device review:** Android Chrome and iOS/iPadOS Safari/Home Screen installation, VoiceOver/NVDA, native Ctrl/Cmd/middle-click gestures, 200–400% zoom, Simple Mode/full theme matrix, real touch double-tap/drag, suspension/storage pressure and interrupted first cache. Emulation/named-control checks do not replace these.
4. **Two-release PWA retention:** test an old installed client against an actual new asset set on supported devices, waiting/Later/explicit update, no mid-game reload and retained saves. The local comment-change fixture cannot establish deployment asset retention/cache eviction behavior.
5. **Online account acceptance:** configured signed-in Supabase sessions/OTP/private profile/account-deletion separation on the same origin remain hosted acceptance. Existing account tests passed; no real account/server data was modified. Concurrent-tab save editing and abrupt process termination mid-write are not newly guaranteed.
6. **Search/content review and measurement:** owner review of final copy/social appearance, optional external schema/rich-result validation without eligibility claims, Search Console/Bing sitemap submission, actual indexing/canonical selection and privacy-respecting field CWV review after an authorized release. Guides/bulk keyword pages remain out of scope.

The local catalogue, metadata, persistence and PWA gates pass. M20C and explicit release authorization remain required before publication.
