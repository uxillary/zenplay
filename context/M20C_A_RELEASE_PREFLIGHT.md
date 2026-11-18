# M20C-A — Production release preflight

Date: 2026-11-17 (Europe/London)

## Recommendation

**CONDITIONAL GO for owner acceptance on the existing preview; NO-GO for production release today.** The complete M20B.2 candidate is committed, already has a successful Cloudflare preview, and passes the existing automated suite. No new preview deployment is needed to begin owner review.

Production blockers are:

1. `ZENPLAY_PRODUCTION_BRANCH` is absent from the production environment. Releasing this candidate unchanged would build production as **noindex**, even though the verified production branch is `main`.
2. Cloudflare currently injects a Web Analytics beacon into both production and preview HTML. This is absent from repository source and needs an owner decision against ZenPlay's no-tracking promise. Nothing was enabled or disabled in this preflight.
3. Physical-device/accessibility acceptance and a genuine two-release test with different asset sets remain incomplete. The local single-/two-tab comment-change fixtures do not replace those checks.

This is preparation for review, not release authorization. No commit, push, merge, deployment, domain/hosted setting/payment change or remote account-data modification was performed. Only this new document changes the tracked-workspace content; build/test outputs are ignored artifacts.

## Evidence boundary and Git readiness

Read M20A, M20B.1, M20B.2, the M20 milestone and infrastructure documentation. Historical unknowns in those documents are superseded only where the authenticated observations below establish a current value.

| Item | Verified result |
| --- | --- |
| Repository/current branch | `uxillary/zenplay`, `codex/m20b1-seo-vertical-slice`. |
| Candidate HEAD | `cd4cdad813b488c00202e16d49080892fd580472` — Complete SEO catalogue and route support. |
| Previous implementation | `0b869fd53276ccd63ce314219ea717216cc43f76` — Home/Solitaire vertical slice. |
| Local main / origin-tracking main | `abd855da3432df4cecc8dd2831cba3e30f46197e`. |
| Difference from local main | 2 commits ahead, 0 behind; 49 changed files, 1,815 insertions / 184 deletions across B.1+B.2. Includes all route/content/discovery/PWA/save-queue work and acceptance scripts. |
| Starting working tree | Clean, including untracked-file inspection. No M20B.2 implementation was waiting to be committed. |
| Remote evidence | Local origin-tracking candidate matches HEAD; independently, Cloudflare's successful preview identifies that exact full SHA and GitHub repository. GitHub authenticated metadata confirms the repository/default branch. No fetch/ref update was performed. |
| Uncommitted after this task | `context/M20C_A_RELEASE_PREFLIGHT.md` only, intentionally left uncommitted for owner review. |

The complete implementation was confirmed by source/diff inspection, all thirteen generated canonical documents plus 404, the nine-URL sitemap, and the fresh verification below. GitHub default branch alone was **not** used to infer Cloudflare production configuration.

## Authenticated Cloudflare settings

Read access existed through the installed Wrangler OAuth session. Project/deployment/domain configuration was inspected with read-only Cloudflare API GETs; secrets and unrelated environment values were neither printed nor saved. No suitable Cloudflare connector was found through plugin discovery. Wrangler 3.81.0's update notice did not prevent read access; no tool/dependency upgrade was made.

| Setting | Verified value / evidence |
| --- | --- |
| Pages project | `zenplay`; Pages hostname `zenplay.pages.dev`. |
| Production branch | **`main`**, from both project and Git-source configuration. This is now verified, not assumed. |
| Git integration | GitHub `uxillary/zenplay`, repository ID `1161058321`; deployments and production deployments enabled. |
| Preview policy | `preview_deployment_setting=all`, includes `*`, no excluded branches. Path includes `*`, no exclusions; GitHub-push deployment triggers observed. A branch push can therefore publish a preview, and a main push can publish production, including documentation-only changes. |
| Build command/output/root | `npm run build`; `dist`; empty root directory (repository root). Never publish `dist-ssr/`. |
| Node/npm actually used | Both latest production/preview logs: Node `22.23.4`, npm `10.9.9`. No project-level `NODE_VERSION` override or tracked Node-version pin found. Node satisfies installed Vite's `^20.19.0 || >=22.12.0` requirement. The full local suite used Node 24.21.0/npm 11.19.0, not hosted Node 22. |
| Custom domain | `playadfree.games` attached; domain, validation and verification statuses active. HTTPS GET succeeded with normal TLS validation. |
| Production variables | Public Supabase URL/publishable-key names present; values not reproduced. `ZENPLAY_PRODUCTION_BRANCH`, `ZENPLAY_NOINDEX`, `NODE_VERSION` absent. Platform CF flags are injected at build time, not listed as custom variables. |
| Preview variables | Project-level environment-variable list empty. Optional online-account acceptance is therefore not established by this preview; do not copy production account configuration without a separate approved plan. |
| Existing production | Successful `d31b8532-76b0-475d-b4d1-e180e0a21a7b`, SHA `abd855d`, completed 18:09:36 UTC on 2026-11-17. `https://playadfree.games/` still serves the older generic `ZenPlay` page, not M20B.2. |
| Existing candidate preview | Successful `159a73f5-a932-474c-8c70-400bbe0cc331`, SHA `cd4cdad`, completed 22:22:42 UTC on 2026-11-17. Created before this preflight by an existing GitHub push. |

Use the immutable [candidate preview](https://159a73f5.zenplay.pages.dev) for this commit's page/device review. The observed [branch alias](https://codex-m20b1-seo-vertical-sli.zenplay.pages.dev) currently serves the same candidate and can change after future pushes. The production Pages hostname also returns the older page with status 200; no redirect from `zenplay.pages.dev` to the custom domain was observed. No domain change is proposed.

**Still unverified:** account/zone-wide cache/transform/redirect rules beyond their observed responses, certificate/DNS configuration beyond active-domain status and working HTTPS, physical browser/PWA behavior on the hosted preview, search indexing/CWV, and optional-account lifecycle on the candidate. Provider behavior can change after this snapshot; recheck identity before any approved write.

## Production indexing: exact configuration

`allowIndexing` in `src/seo/discovery.ts` permits public indexing only when:

- Vite mode is `production`;
- `ZENPLAY_NOINDEX` is not `1`;
- and, on Pages (`CF_PAGES=1`), `CF_PAGES_BRANCH` exactly equals the nonempty `ZENPLAY_PRODUCTION_BRANCH`.

For the **verified** current configuration, after separate approval:

| Environment | Owner configuration |
| --- | --- |
| Production | Set `ZENPLAY_PRODUCTION_BRANCH=main`; leave `ZENPLAY_NOINDEX` unset (or otherwise not `1`). Retain platform-provided CF flags; do not override them. Keep the two existing public Supabase values unchanged. |
| Preview | Leave `ZENPLAY_PRODUCTION_BRANCH` unset, or use `main` consistently; never set it to the implementation/test branch. Recommended defense in depth: set `ZENPLAY_NOINDEX=1` specifically in Preview after approval. |
| Other staging/direct-upload build | Explicitly build with `ZENPLAY_NOINDEX=1`; do not upload a normal local production artifact to a public staging host and assume it is noindex. |

Changing variables does not rewrite an uploaded artifact. **Do not promote the current preview artifact straight to production:** its HTML marker/meta, global `_headers` and robots already say noindex/disallow. Rebuild the candidate in the correctly configured Production environment during an authorized release. Check the resulting nine public URLs have indexable meta/headers and robots permits crawling; utilities/404 must stay noindex. Canonicals stay `https://playadfree.games` in every environment.

The current preview was directly verified to have `data-indexing=noindex`, noindex meta and `X-Robots-Tag: noindex, follow` on all thirteen pages, plus `Disallow: /` robots. Client navigation retains a build's noindex marker. These safeguards supplement [Pages' documented preview header](https://developers.cloudflare.com/pages/configuration/preview-deployments/#preview-indexing-by-search-engines).

## Generated output and real Pages compatibility

| Audit | Local artifacts and existing preview observations |
| --- | --- |
| Canonical documents | Home, eight games and four utilities: all 200, distinct prerendered HTML, correct declared path, one H1/main and absolute self-canonical. Production policy has nine indexable pages; preview deliberately has none. |
| `_redirects` | Twelve exact no-slash → slash rules, explicit 301, no wildcard SPA rule. Every game/utility no-slash request returned 301 with the test query retained. |
| Directory index URLs | All twelve `/.../index.html` requests returned **308** to the slash canonical with the query retained. Local Vite uses 301 here; both are permanent, but the hosted result is the acceptance evidence. |
| `_headers` | Production artifact marks utilities/404 noindex; preview artifact marks all paths noindex. Actual preview header observed. Redirects have provider precedence over headers, so verify the final destination rather than relying on an alias response alone. |
| Sitemap | 200 `application/xml`; exactly nine distinct production-canonical URLs, excluding utilities, aliases/errors/queries; no invented lastmod. |
| Robots | Preview: 200 `text/plain; charset=utf-8`, disallow all. Locally rebuilt production-policy file allows crawling and references the canonical sitemap. Production-policy provider headers after release remain a gate. |
| Unknown URLs | `/m20c-not-found/` and `/games/Sudoku/` returned real 404s, no canonical and noindex meta/header. Top-level 404 opts out of Pages' SPA fallback. |
| 404 asset | `/404.html` returns 308 → `/404`, then 200 for the literal asset. Unknown paths still return 404. All fourteen HTML precache-installation URLs followed provider redirects to 200 and the correct document marker. |
| SW/manifest | 200, correct JavaScript/manifest MIME; SW revalidates (`max-age=0, must-revalidate`), root manifest ID/scope/start URL remain `/`. |

These results agree with the static-file routing/404 model in [Serving Pages](https://developers.cloudflare.com/pages/configuration/serving-pages/) and exact static rules in [Pages redirects](https://developers.cloudflare.com/pages/configuration/redirects/). No speculative Wrangler manifest, Worker or new redirect was added.

### Existing hosted analytics/HTML transformation

Project `build_config` has Web Analytics configuration present. Both public production and candidate preview include a deferred `https://static.cloudflareinsights.com/beacon.min.js` script with `data-cf-beacon`; its token is intentionally omitted here. This is **pre-existing hosted injection**, not a new repository script or a change made during preflight. It conflicts with treating repository-only “no analytics configured” evidence as proof of the served product's no-tracking behavior.

Recommended owner action is to separately approve disabling Pages' automatic Web Analytics injection to preserve the stated product promise, then rebuild/recheck as necessary. Alternatively, an explicit privacy/product decision and accurate documentation are required; do not silently accept or change the setting.

All fourteen served HTML bodies differ byte-for-byte from their SW manifest's revision hashes; hosted HTML rewriting includes the confirmed beacon. Local revisions match final generated artifacts. Workbox revisions are cache-version keys, not response-integrity assertions, so this observation alone does **not** prove installation fails. It does mean local byte/hash equivalence must not be claimed for the current served preview. Retest hosted hydration, CacheStorage contents and offline behavior after resolving the injection decision.

## Fresh automated verification

| Check | Preflight result |
| --- | --- |
| `npm test` | 229 passed, 0 failed. |
| `npm run typecheck` | Passed. |
| `npm run lint` | Passed. |
| `npm run build` | Passed, including `tsc -b` and isolated renderer/client builds; 250 precache entries / 5,408.09 KiB. Existing Browserslist age warning remains. |
| `npm run verify:seo` | Passed thirteen page documents, aliases/404s, discovery/social/JSON-LD, final local HTML revisions/install responses and all lazy chunks. |
| `npm run test:seo-browser` | Passed complete local game/utility, save/Continue, accessibility smoke, mobile, offline and explicit-update matrix. No runtime/console/hydration warnings. |
| Additional two-tab local fixture | Passed: Update now in a Home tab reloaded that tab while an active Solitaire tab retained both its document time origin and in-memory sentinel. That tab had no Update now button and did not reload. Same assets/comment-only SW change; not a genuine two-release retention test. |
| `git diff --check` / new document validation | Passed. |

Local tests use disposable browser profiles and fixture-only saves. No real email OTP, private-profile mutation/deletion, purchase or production browser session was exercised. The read-only hosted probes executed no application JavaScript. The global CLI version notice and existing Browserslist warning were not used as reasons to change dependencies.

## Owner physical-device checklist

Record device/OS/browser/version, date, pass/fail and a short failure reproduction. Use a disposable preview profile/device installation for upgrade experiments; do not clear an existing production user's storage or uninstall their PWA to force an update.

- [ ] **Android Chrome:** open all eight direct URLs, play a move, Home/Continue for the six supported games, refresh/Back/Forward, install from Home and a game landing; verify standalone launch.
- [ ] **iPhone/iPad Safari:** browser play, Share → Add to Home Screen, launch/suspend/resume, portrait/landscape, direct links and offline after readiness. Check iPad as well as phone layout where available.
- [ ] **Desktop keyboard:** Tab/Shift-Tab and visible focus, Skip to content, Home/game/related links, Enter/Space and implemented arrow controls, Rules/dialog dismissal and focus return; no trap. Check native Ctrl/Cmd/middle-click/new-tab behavior.
- [ ] **Screen readers:** NVDA with desktop Chrome/Edge and VoiceOver with Safari; one H1/main, correct page title/heading focus, loading/game announcements, named controls and no disclosure of face-down card identities.
- [ ] **Zoom/preferences:** 200%, 300%, 400%, large text/pieces, high contrast, Simple Mode and app/system reduced motion. Controls stay reachable with scrolling; no new zoom restriction or essential clipped board area.
- [ ] **Touch:** Solitaire taps, double-tap and multi-card dragging, invalid/cancelled drop and Undo; Word Search taps/drag endpoints; verify no accidental scroll/selection interference. Do not waive physical touch testing based on emulation.
- [ ] **Offline/Continue:** after Home-only readiness, disable networking and enter/reload all games and utilities. Resume known Solitaire/Sudoku/Pairs/Word Search/Fifteen/Mahjong positions; compare session/progress/statistics/preferences. Noughts & Crosses/Flags intentionally do not resume unfinished rounds. Online-account unavailability must not block games.

## Two-release PWA acceptance plan — not performed here

**Use one stable non-production origin and root scope for both releases.** Immutable deployment hashes have different origins and cannot demonstrate an installed-client upgrade or shared saves. Production saves cannot be assessed by copying a preview URL; browser data is origin-scoped.

1. After separate approval for test-branch creation/push/deployment, use a dedicated preview branch/alias in project `zenplay`, never the production branch/domain. Release A should reproduce the current production app (`abd855d`); release B should use candidate `cd4cdad` with a genuinely different asset set. Keep the same preview alias, manifest identity, scope and `/sw.js` throughout. Do not reset or repoint the working implementation branch to create A.
2. On A, await complete cache readiness, install the PWA and create unfinished positions in all six resumable games. Record visible positions/move counts, selected settings, local profile and statistics in the test profile. Keep one tab/standalone window actively playing and another at Home. No site-data clearing, forced unregister or save-format migration.
3. Deploy B to that **same test alias only**, after approval. Capture A/B deployment IDs and asset lists. A clients may discover the update through normal registration/reopening a second tab; record the method. Confirm B is waiting and A's active game, selection and page do not refresh/restart or lose a just-made move.
4. Choose Later in Home, keep playing, and test an A game chunk not previously executed. Verify the active client remains usable online/offline while B waits. Do not assume prior hashed assets remain available from the network: [Pages documents that cached old assets may disappear](https://developers.cloudflare.com/pages/configuration/serving-pages/#asset-retention).
5. Choose Update now in Home while the other A tab is still playing. Confirm Home reloads into B, the active game tab is not interrupted, and both remain usable. Specifically exercise subsequent navigation/lazy imports in the older tab after B activation: Workbox removes obsolete precache entries on activation, so this is a real different-assets risk the comment-only fixture cannot cover. If it fails, stop release and request a targeted compatibility fix; do not force reloads during play or wipe caches as a workaround.
6. On B, verify all thirteen canonical pages, all eight games/assets, offline direct entry/reload, correct metadata/headings, new 404 behavior, legacy root history migration and install/start URLs. Compare each recorded save/session, statistics, settings and local profile. Check no private API responses enter CacheStorage. Run with multiple tabs and with the standalone app open together.
7. Close all A clients and relaunch offline; B must start and supported saves must resume. Natural activation after all old clients close is expected and is not an interruption. Also test suspension, interrupted initial install/update and low-storage/eviction behavior with the owner checklist.
8. Preserve the approved known-good deployment ID and test rollback behavior on the test origin. A server rollback does not itself remove a newer installed worker; test recovery without clearing user data. Approve production only when device results and same-origin A→B evidence are recorded. Optional-account lifecycle tests require a separately approved disposable/nonproduction account plan.

## Exact next actions

1. Review this document and the existing [candidate preview](https://159a73f5.zenplay.pages.dev); no new preview publish is needed for ordinary device/page review. The only uncommitted repository item is this preflight document.
2. Separately approve the minimum hosted changes: Production `ZENPLAY_PRODUCTION_BRANCH=main`, production noindex override absent, preview-only `ZENPLAY_NOINDEX=1` if desired, and the analytics-injection decision. Consider pinning the already-used supported Node `22.23.4` for reproducibility; do not change Node versions silently.
3. Complete the physical checklist and approve/run the stable-origin two-release test. If candidate/host settings change, rerun the suite and preview acceptance. Optional-account QA needs approved nonproduction configuration; preview currently has no project-level account values.
4. Only after sign-off, separately authorize the release merge/push. Main pushes automatically deploy. Build fresh in Production, confirm source SHA and indexing outputs, and verify canonical-domain HTTP/headers/robots/sitemap plus installed-client behavior. Do not promote the current noindex preview artifact unchanged.
5. After an authorized release, submit the sitemap in Search Console/Bing and monitor real indexing/canonical selection/CWV without invented ranking guarantees. Keep rollback evidence and never discard saves to resolve an update problem.

No action above was executed beyond read-only inspection, local verification and preparation of this document.
