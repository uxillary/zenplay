# M18D Flags release readiness

## Recommendation

**CONDITIONALLY READY.** Available automated/model checks and the production build pass, with no reproducible Flags defect found. The release decision remains conditional on owner/browser checks: the current build could not be reached in the in-app browser, so rendered device, keyboard, zoom, and offline runtime behavior have not been verified.

## Scope and evidence

Reviewed the M18A through M18C-B notes, release checklist, Flags screen/model/tests, GameShell integration, app navigation imports, shared focus styling, and Vite PWA configuration. This review did not change gameplay, country data, region classification, SVG artwork, or caching behavior.

Status terms: **PASS** means directly verified by the described check; **FAIL** means a defect was observed; **NOT VERIFIED** means evidence was unavailable; **NOT APPLICABLE** means the check does not apply.

## Browser preview investigation

**NOT VERIFIED.** Started the repository's production preview successfully on a fresh strict port, 4181 (`vite preview --host 127.0.0.1 --port 4181 --strictPort`). The in-app browser returned `net::ERR_CONNECTION_TIMED_OUT` for `http://127.0.0.1:4181`. Thus the server startup succeeded but the browser could not connect across the local preview boundary. Prior milestone notes record the old 4173 origin showing a stale seven-game build, other fresh ports timing out, and HTTP requests blocked by socket permissions. A stale service worker, browser storage, or origin mismatch cannot be confirmed or ruled out because the current preview never loaded and browser storage/service-worker inspection was unavailable. No production service-worker behavior or deployment infrastructure was changed.

## Gameplay and navigation

- **PASS (automated model coverage):** Classic creates ten unique questions with four distinct choices and one correct answer; correct/incorrect feedback, answer locking, explicit continuation, completion, replay reset, and region pools are covered by tests.
- **PASS (automated model coverage):** Practice starts with ten unique countries, retries missed flags, tracks learned countries uniquely, prevents duplicate retries, completes after all are learned, and resets on replay. Region pool generation is covered.
- **PASS (automated model coverage):** Reverse reuses the shared ten-question loop; tests cover four distinct choices, one correct answer, answer lock, result/replay state, region pools, neutral pre-answer labels, and post-answer status. The screen source provides a country prompt, four local SVG buttons, and explicit feedback.
- **NOT VERIFIED (browser):** Actual Home → setup → game → results → replay/change setup → Games navigation and browser Back/Forward were not exercised.

These are automated/model and source-level results, not a claim of manual play through the rendered interface.

## Responsive layout and zoom

**NOT VERIFIED.** No rendered current-build view was available at 390px, 360px, 320px, desktop, portrait/landscape, or 200% zoom. CSS/source inspection is not a substitute for visual QA. The implementation uses wrapping text for setup/answer labels, a responsive Reverse grid, intrinsic SVG sizing with `object-fit: contain`, and shared visible focus rules; these are implementation observations only. Owner verification is required.

## Accessibility

- **PASS (source/test inspection):** Native buttons, mode/region pressed state, labelled groups, question/progress text, polite feedback status, visible focus rules, neutral Classic/Practice flag naming, and neutral Reverse flag-option names before answering are present and covered in source/model tests.
- **NOT VERIFIED:** Keyboard order/activation and focus transitions were not manually exercised. Contrast, touch target comfort, and reduced-motion behavior were not visually/device tested. No screen reader was used, so no screen-reader testing is claimed.
- **Known limitation:** Reverse asks players to visually recognise flag images. Neutral option names avoid revealing the answer but do not make the activity playable nonvisually. This is documented in M18C-B and remains a product limitation, not a newly observed defect.

## Offline PWA

- **PASS (static/build evidence):** PWA configuration precaches built JavaScript, CSS, HTML, SVG, PNG, and ICO assets; the prior successful build record reports 212 precache entries and inclusion of all 195 flag SVGs. Flags refer to local `/flags/{id}.svg` assets.
- **NOT VERIFIED (runtime):** This turn could not load the production preview in a browser. Service-worker install/activation/control, offline reload, and Classic/Practice/Reverse play while offline were not performed. Static precache coverage does not establish runtime offline success.

## Performance

- **PASS (measurement):** Existing production artifact's main JavaScript file measures 566,762 bytes (about 566.76 kB), consistent with the M18C-B warning above Vite's 500 kB advisory threshold.
- **PASS (architecture inspection):** `App.tsx` statically imports all game screens, including `FlagsScreen`; no `React.lazy`/dynamic-import pattern exists. Flags modules are eagerly included in the application graph. Public flag SVGs are copied/pre-cached assets and do not contribute to JavaScript bytes. The six Flags model/UI source files total about 42.1 kB before compilation/minification.
- **NOT VERIFIED:** A source-map build intended to attribute minified bytes to individual modules failed in Vite's config/PWA resolution with `EPERM` before module analysis. Consequently exact minified Flags contribution and the dominant contributors were not isolated. The available evidence does not support a Flags-only split: all games are eager, no loading-boundary pattern exists, and no measured benefit can be claimed. No speculative optimization or Browserslist update was made.

## Fixes and automated verification

No corrective code changes were justified by a reproduced defect. M18D adds this report, the owner checklist, and a release-gate summary in `RELEASE_CHECKLIST.md`.

- `npm test` — **PASS**, 178 tests; 0 failures.
- `npm run typecheck` — **PASS**.
- `npm run lint` — **PASS**.
- `npm run build` — **PASS**, Vite built successfully; PWA generated 212 precache entries (3,181.44 KiB). Existing warnings: main JS chunk 566.76 kB exceeds the 500 kB advisory threshold; Browserslist `caniuse-lite` data is eight months old.
- `git diff --check` — **PASS**, with Git's existing LF-to-CRLF working-copy notice for `src/components/GameCard.tsx`.

## Remaining release actions

Complete [M18D Flags owner QA](M18D_FLAGS_OWNER_QA.md) against the latest deployment. In particular, verify current-build visuals at target widths and 200% zoom, keyboard use/navigation, and a real offline session. Keep these checklist items open until directly tested. No known product defect is currently reproduced; release is conditional on those unverified checks.
