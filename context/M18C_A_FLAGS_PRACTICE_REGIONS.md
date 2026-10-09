# M18C-A Flags Practice and regions

## Session model

Flags now opens on a small setup screen with **Classic** or **Practice** and **All countries** or one of five region choices. Defaults remain Classic and All countries. Starting creates an in-memory session whose mode, region, and eligible country pool stay fixed until the player ends it. Replay creates a fresh round in the same mode and region; Back to setup ends the current session so another configuration can be selected. No account, network request, saved learning history, or new game system was added.

Classic still generates ten unique correct countries with four shuffled choices and retains its score, feedback, explicit continuation, results, and replay. Region-filtered Classic uses the selected pool for correct countries and distractors. The All countries default passes the existing 195-country set unchanged.

## Practice and retry scheduling

Practice begins with ten unique correct countries selected from the eligible pool. One question is current and the remaining initial questions are pending. On a miss, feedback names the correct country and explains briefly that the flag will return; that question is appended once to the end of the pending queue. This naturally gives other pending questions priority. A retry can be appended again after another miss, without a mistake limit. Correct answers add the country's stable ID to the learned set once. A missed question is removed from the queue when it becomes current, so the duplicate guard prevents multiple pending copies without blocking future retries.

The player explicitly advances after every answer. The session completes only after all ten selected IDs have been learned and the player advances from the final feedback. Progress reports **N of 10 learned**, not attempts or a score percentage. The completion screen reports learned flags and, if any, extra answers made on retry questions.

## Geographic classification

Country membership follows the UN Statistics Division's [M49 geographic regions](https://unstats.un.org/unsd/methodology/m49/overview/). M49 gives each country or area one region and explains that the grouping is for statistical convenience and does not imply political affiliation. ZenPlay retains its existing fixed set of 195 ISO entries; dependencies and other areas listed by M49 are not added.

The selectable **Americas** combines M49 Northern America, Central America, the Caribbean, and South America. Africa, Asia, Europe, and Oceania use the corresponding M49 top-level regions. Under M49, Armenia, Azerbaijan, Cyprus, Georgia, and Türkiye are assigned to Asia, and the Russian Federation to Europe. Those placements are applied consistently. The current dataset has 54 African, 48 Asian, 44 European, 35 American, and 14 Oceanian countries. Every region therefore has at least 13 countries for ten unique correct answers plus three distractors.

The explicit ISO ID groups live alongside the country data in `src/games/flags/model/countries.ts`; runtime checks fail if a supported country lacks a region. The `region` field is typed to the selectable set. `All countries` is a filter option, not a country classification.

## Setup and accessibility

Mode and region are grouped, native buttons with `aria-pressed` state and visible selected styling. They retain focus when selected; starting is one clearly labelled primary action. Setup is not shown during a round, so configuration cannot silently alter an active session. The current question receives focus at session start and after explicit continuation; answer feedback moves focus to the continuation button; completion receives heading focus. Leaving a session for setup returns focus to its heading.

Practice progress is announced as learned-country progress. Existing native answer buttons, neutral pre-answer flag description, answer locking, country-specific feedback, status region, and visible non-color state cues remain in use. The setup grid has two columns on narrow screens and region buttons stay at least 3.5rem tall; larger screens can use three region columns.

## Verification and limitations

Focused tests cover the M49 group sizes and boundary placements, eligible correct answers and distractors in both modes, unique choices, unchanged Classic defaults, unique Practice selection, learned progress, queued retries, repeated misses, duplicate prevention, completion, replay reset, and setup/accessibility affordances. The 195 SVG mapping and existing Classic/navigation checks remain in the suite.

- `npm test` — passed, 175 tests.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed; PWA generated 212 precache entries (3,178.38 KiB). The existing >500 kB main-chunk and outdated Browserslist-data warnings remain.
- `git diff --check` — passed; Git reported an LF-to-CRLF working-copy warning for the pre-existing `src/components/GameCard.tsx` change.

Browser visual checks at 390px, 360px, and 320px remain **NOT VERIFIED**: the production preview at port 4173 displayed the stale seven-game app and port 4174 timed out. This matches the earlier M18B.1 issue, but the browser tooling could not inspect its service-worker registration or storage. Screen-reader behavior and actual production offline runtime also remain **NOT VERIFIED**; no browser or offline pass is claimed here. Local PWA configuration and bundled SVG assets are unchanged.

The production build and Vite preview started at port 4173, but the in-app browser loaded the previous seven-game screen there. A second production preview at port 4174 timed out in the browser. The stale screen is consistent with the earlier M18B.1 preview problem, but the browser tooling did not expose service-worker or storage inspection, so the cause is not confirmed. No browser storage, service worker, or PWA configuration was changed. Mobile/desktop visual checks, keyboard/manual accessibility checks, and actual offline runtime remain **NOT VERIFIED**; the corresponding items remain open in `RELEASE_CHECKLIST.md`.

## M18C-B handoff

If Reverse mode is the next agreed feature, build it on this setup/session boundary and reuse the M49 eligible-country pool, local flag assets, answer locking, and explicit continuation. Keep its completion and replay behavior mode-specific. First retain the outstanding mobile/browser and offline release checks; do not treat the earlier unavailable visual QA as completed.
