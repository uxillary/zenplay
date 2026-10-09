# M18B.1 Flags visual QA

## Browser and preview findings

The existing in-app browser preview at port 4173 displayed an older seven-game build, so it did not establish whether a service worker controlled the origin or whether storage was stale. A fresh Vite development server started successfully at `http://localhost:5173/` and announced the local and network addresses, but the in-app browser timed out when opening it. A local HTTP request to `127.0.0.1:5173` was also blocked by the environment's socket permissions. Thus the browser bridge could not reach the running server; service-worker registrations, browser storage, and the current rendered build could not be inspected. The preview process was stopped after the check. No PWA caching configuration or origin data was changed.

## Visual and interaction checks

| Check | Result |
| --- | --- |
| Flags at 390px, 360px, and 320px CSS widths | **NOT VERIFIED** — browser could not load the current app |
| Current Flags screen at desktop width | **NOT VERIFIED** |
| 200% zoom / increased text sizing | **NOT VERIFIED** |
| Complete Home → Flags → answers → results → replay → Games journey | **NOT VERIFIED** |
| Nepal flag and long country-name wrapping in the rendered UI | **NOT VERIFIED** |
| Keyboard sequence and focus changes in the rendered UI | **NOT VERIFIED** |
| Rendered accessibility tree / screen-reader behavior | **NOT VERIFIED** |

No visual or runtime issue was observed because the current screen could not be opened. Source inspection confirms that choices are native buttons, answer submission is locked until explicit continuation, the final continuation completes the round, replay creates a new round, and focus effects target the continuation button, next question, or results heading. Existing automated tests cover the ten-question state transitions, locking, feedback, replay, neutral flag label, ISO mapping, and local SVG validity. These code and test findings do not substitute for manual browser interaction or screen-reader verification.

## Offline runtime

**NOT VERIFIED:** The browser could not load the production preview, so service-worker install/activation, offline reload, Flags navigation, and a full offline round were not exercised. The current production build generated 212 precache entries; the output contains 195 SVG files under `dist/flags`, and the generated service worker names all 195 flag paths. This verifies build-time asset coverage only, not offline runtime behavior.

## Issues and fixes

No evidence-backed UI issue could be established. No corrective code or regression-test change was made. The browser preview limitation is documented here rather than addressed by changing production caching or deployment settings.

## Verification

- `npm test` — passed, 167 tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; generated 212 PWA precache entries (3,174.42 KiB).
- Production output — 195 flag SVG files; generated service worker includes all 195 flag paths.
- `git diff --check` — passed; Git reported an existing LF-to-CRLF working-copy warning for `src/components/GameCard.tsx`.
- Build warnings: the main JavaScript chunk is 561.64 kB minified (over the 500 kB advisory threshold); Browserslist's `caniuse-lite` data is eight months old.

## Limitations and M18C readiness

M18B.1 could not establish visual readiness at the requested device sizes, desktop zoom readiness, manual gameplay/keyboard behavior, screen-reader behavior, or actual offline runtime. Flags has passing automated checks and complete build-time local asset coverage, but those are not a visual or offline sign-off. Treat Flags as **not yet visually/offline verified for release**. M18C may proceed as development work if desired, while the browser/device and offline checks above remain release QA items; do not interpret this milestone as an M18C implementation.
