# M18H Flags final QA

**Audit date:** 10 October 2026  
**Build tested:** production build from commit `4bdb879ee5efaa671edf34ef046d218a2943eb0e`  
**Environment:** Windows workspace; Vite 7.3.1 production build and preview on `http://127.0.0.1:4183/`. The Codex in-app browser timed out connecting. Browser version, viewport, and device-emulation settings were therefore unavailable. No physical device or screen reader was used.

This audit separates automated and source-level evidence from rendered browser or device behaviour. No application code was changed because no reproducible defect was observed.

## Results

| Area | Status | Evidence and limits |
| --- | --- | --- |
| Production build | PASS | Vite production build completed; 221 precache entries (3,208.91 KiB). |
| Mobile layout at 320, 360, and 390px | NOT VERIFIED | Browser did not connect; no current-build render or viewport measurement. |
| Representative desktop layout | NOT VERIFIED | Browser did not connect; no rendered desktop review. |
| Classic mode | PASS (automated model/source coverage); NOT VERIFIED (browser) | Tests cover ten unique questions, four choices, correct/incorrect feedback, locking, continuation, results state, replay reset, and region pools. Actual rendered play was not exercised. |
| Practice mode | PASS (automated model/source coverage); NOT VERIFIED (browser) | Tests cover ten unique initial countries, missed-question requeue without duplicates, learned-country tracking, completion, replay reset, setup, and region pools. Actual rendered play and feedback readability were not exercised. |
| Reverse mode | PASS (automated model/source coverage); NOT VERIFIED (browser) | Tests cover four choices, answer evaluation/locking, shared round progression, results state, replay reset, region pools, neutral pre-answer accessible labels, and post-answer identification. Visual distinguishability and rendered play were not exercised. Reverse remains an inherently visual recognition activity and is not fully playable nonvisually. |
| Learning hooks | PASS (automated/source review); NOT VERIFIED (browser) | Tests and source review cover lookup, missing-hook fallback, disclosure structure, post-answer availability, and prominent Practice feedback after an incorrect answer. No rendered hook was inspected. Coverage remains 194/195; Afghanistan has no hook by owner decision. |
| Keyboard flow and focus | PASS (source-level review); NOT VERIFIED (manual) | Native buttons, disclosure summary, visible-focus styling, and heading/continue focus effects are present. Tab order, activation, and focus retention were not manually exercised. |
| Semantics and announcements | PASS (source-level review); NOT VERIFIED (screen reader) | Named headings/groups, pressed states, polite feedback/progress/loading statuses, result statuses, and alert error state exist. Actual announcement timing and speech output were not tested. |
| Zoom and text scaling | NOT VERIFIED | 100%, 200%, and independent text scaling were not tested in a rendered browser. |
| Offline runtime | NOT VERIFIED | No service-worker installation/control, offline reload, local asset render, lazy-chunk availability, or offline gameplay was exercised. M18G precache inclusion remains build evidence only. |
| Lazy-loading/navigation | PASS (automated architecture guard); NOT VERIFIED (browser) | Tests confirm game screens load dynamically and loading/error states are present. Home, Flags, other games, Back/Forward, delayed chunks, and recovery were not rendered or exercised. |
| Syria/Kyrgyzstan artwork | PASS (automated structural checks); NOT VERIFIED (visual comparison) | Tests assert Syria's three five-pointed stars and bands, plus Kyrgyzstan's 5:3 viewBox, 40 rays, and core colours. No current-browser rendering or comparison with the Kyrgyzstan government construction plate was possible. |
| Honduras/Afghanistan artwork | PASS (preservation checks); NOT VERIFIED (visual review) | Automated checks preserve Honduras `#0073cf` and verify Afghanistan's SVG digest. Honduras's precise blue remains unresolved; the Afghanistan representation remains an owner decision. No artwork was altered. |

## Environment and browser attempt

The production build was served by Vite preview on port 4183. A single attempt to open it in the Codex in-app browser returned a connection timeout. Following the milestone instruction not to repeatedly retry inaccessible browser environments, no alternate port or stale preview was tried. Since the page never loaded, there is no browser version, viewport, emulation configuration, screenshot, or browser runtime log to report. The preview server starting successfully does not count as browser QA.

## Code-level review

Classic and Practice use local SVG flags and keep question generation, retrying, and scoring in the existing engine. Reverse presents a country prompt with four local flag images and neutral option names before selection. After answering, its labels identify the chosen and correct options. This protects the answer before selection, but image recognition itself is visual.

Flags setup and answers use native buttons with `aria-pressed` state; the mode and region groups have names. Feedback uses a polite atomic status, Practice progress is polite, learning content uses native `<details>/<summary>` outside prominent Practice feedback, and result headings receive focus in the component effect. The app-level lazy fallback is a polite status, and the game error boundary exposes an alert and reload button. These are source observations; they do not establish actual browser focus behaviour or assistive-technology announcements.

Styles set country answer and setup controls to a 3.5rem minimum height, mode options to 4.75rem, learning disclosure summaries to 2.75rem, and Reverse cards to a 10rem minimum height. Flag images use `object-fit: contain`; country labels and hook text use wrapping. Without rendered dimensions, these rules do not establish absence of overflow, adequate touch comfort, contrast, readability, or lack of visual obstruction.

## Defects and severity

- **P0 — none reproduced.**
- **P1 — none reproduced in available automated/source checks.** This is not evidence that browser-only or offline defects are absent; those checks remain open.
- **P2 — follow-up items:** Afghanistan's representation needs the owner decision in [M18F Afghanistan decision](M18F_AFGHANISTAN_FLAG_OWNER_DECISION.md); Honduras has no authoritative precise digital blue value in the reviewed evidence; and Kyrgyzstan's simplified tunduk still needs visual comparison with the revised official construction plate. These are carried findings, not defects reproduced in M18H.
- No fix was justified by available evidence. There are no M18H code changes to verify.

## Automated verification

| Check | Status | Result |
| --- | --- | --- |
| `npm test` | PASS | 192 passed, 0 failed. |
| `npm run typecheck` | PASS | TypeScript completed without diagnostics. |
| `npm run lint` | PASS | ESLint completed without diagnostics. |
| `npm run build` | PASS | Vite production build completed; entry 473.40 kB raw / 137.90 kB gzip; Flags chunk 46.56 kB / 13.45 kB gzip; 221 precache entries. Browserslist reports `caniuse-lite` data is eight months old. |
| `git diff --check` | PASS | No whitespace errors. |
| Browser test suite | NOT APPLICABLE | No browser automation suite or E2E framework is configured in the project scripts. |

The automated model tests are useful evidence for game rules; they do not replace interaction testing. Build precache contents do not prove that an installed browser can reload and play offline.

## Remaining release checks

No P0/P1 defect was reproduced, but release QA is **CONDITIONAL** and should not be described as fully release-ready until owner testing completes. Required open checks are:

- Current production browser review at 320px, 360px, 390px, and a representative desktop size; verify page overflow, text wrapping, flag visibility, controls, feedback, hooks, results, loading, and error layouts.
- Render and play a few questions in Classic, Practice, and Reverse; check region changes and return/replay flow.
- Keyboard-only full flow including Back/Forward and focus after question/screen transitions.
- Screen-reader test with a named reader, if available; otherwise keep real screen-reader behaviour marked NOT VERIFIED.
- 100% and 200% zoom, and increased text size where available.
- Install/load online, wait for offline readiness, disconnect, reload, play each mode, confirm flags/hooks and lazy chunks, then return Home and reopen Flags.
- Visually compare the corrected Syria and Kyrgyzstan designs; specifically compare Kyrgyzstan's simplified tunduk with the official construction plate.
- Resolve the Afghanistan representation with the product owner before describing its current status in the game.

Use [M18H owner phone checklist](M18H_FLAGS_OWNER_TEST_CHECKLIST.md) for the achievable device pass. Keep browser, accessibility, offline, and owner QA checklist items open until directly verified.
