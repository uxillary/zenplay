# ZenPlay release checklist

Complete the manual and release items against the production build and deployment target. Do not mark a device check complete without testing that device.

## M18E-B Flags learning feedback

- [x] Post-answer learning feedback and missing-hook fallback implemented; automated verification passed (see [M18E-B report](context/M18E_B_FLAGS_LEARNING_FEEDBACK.md)).
- [ ] Browser visual and interaction QA — **NOT VERIFIED**: preview started on fresh port 4182, but the in-app browser timed out. Check 390px, 360px, 320px, desktop, 200% zoom, all feedback variants, and a country without a hook.
- [ ] Manual keyboard and screen-reader review — **NOT VERIFIED**; no screen reader session was performed.

## M18D Flags release gate

- [x] Automated tests, typecheck, lint, production build, and diff whitespace check passed in the M18D checkout (see [M18D release-readiness report](context/M18D_FLAGS_RELEASE_READINESS.md)).
- [ ] Browser interaction, responsive sizes, zoom, and visual checks — **NOT VERIFIED**: fresh production preview server started on port 4181, but the in-app browser timed out connecting. No current-build browser render was available.
- [ ] Actual offline runtime — **NOT VERIFIED**: static PWA precache configuration/build coverage is present, but service-worker control and offline play could not be exercised.
- [ ] Owner device QA — **PENDING**: complete [M18D Flags owner QA](context/M18D_FLAGS_OWNER_QA.md) against the latest deployed build.
- [ ] Manual keyboard and assistive-technology review — **NOT VERIFIED**; Reverse remains an inherently visual recognition activity.
- **Known product defects:** none reproduced in available automated/model checks.
- **Release decision:** CONDITIONALLY READY; browser/device/offline items above remain release gates.

## Automated

- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [x] `npm run build`
- [x] `git diff --check`

## M18E-C3 Flags library and artwork audit

- [x] Memory library expanded to 193/195 with documented Afghanistan and Syria hook exceptions; coverage and regional totals are tested (see [M18E-C3 final audit](context/M18E_C3_FLAGS_FINAL_LIBRARY_AUDIT.md)).
- [x] All 195 country IDs map to unique, valid local SVGs; all viewBox dimensions parse and are positive.
- [x] **P1 — Syria artwork correction:** completed in M18F; current three-star artwork and a supported learning hook are bundled locally.
- [x] **P2 — Kyrgyzstan post-2023 artwork:** forty straight rays and the revised central symbol were applied in M18F; visual/device QA is still open below.
- [ ] **Owner decision — Afghanistan:** choose which representation the quiz should teach; see [M18F decision note](context/M18F_AFGHANISTAN_FLAG_OWNER_DECISION.md).
- [ ] **Honduras colour:** no authoritative digital colour value found; M18F retains the existing shade and hook.
- [ ] Existing browser, device, screen-reader, and offline runtime checks remain **NOT VERIFIED**; complete the open items above before release.

## M18F Flag asset remediation

- [x] Syria artwork updated from current declaration and official usage sources; SVG structure and hook verified.
- [x] Kyrgyzstan artwork updated from the 2023 technical specification; 5:3 proportion and 40 straight rays verified structurally.
- [x] Honduras blue retained because official sources do not establish a precise digital value; Afghanistan asset preserved and no hook added.
- [x] Attribution and provenance updated; PWA build glob includes local SVG assets.
- [x] `npm test` (191 passed), `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check` passed (details in [M18F report](context/M18F_FLAGS_ASSET_REMEDIATION.md)).
- [x] Production build includes the corrected Syria and Kyrgyzstan SVGs in the 212-entry precache manifest.
- [ ] Browser visual comparison of the two replacement assets — **NOT VERIFIED**; compare Kyrgyzstan's simplified tunduk with the revised government construction plate.
- [ ] Actual offline runtime — **NOT VERIFIED**; build precache coverage does not verify browser service-worker operation.
- [ ] Owner selects Afghanistan representation before labeling or changing that asset.

## Local production preview review

- [x] Home, Settings, and install instructions reviewed
- [ ] Review the default screen of all eight games, including Mahjong and Flags, in the production preview
- [ ] Review Flags at 390px, 360px, 320px, and desktop; complete a full round, replay, and return to Games
- [ ] Verify Flags Classic and Practice setup, each region filter, retry loop, completion, replay, and return to setup
- [ ] Verify Flags Reverse image-choice grid, feedback, results, replay, and return to setup at 390px, 360px, 320px, and desktop
- [x] Continue indicators returned after refreshing the preview for auto-saved game states

## M15C browser review (isolated localhost)

- [x] Home, game, Settings, browser Back/Forward, and in-app Back to Games navigation
- [x] Saved-game, statistics, and preference actions with confirmation, cancellation, and category separation
- [x] Home, Settings/Data, and confirmation dialog at 1280×900, 390×844, 360×800, and 320×780
- [x] No document-level horizontal overflow; tested browser QA data cleared afterward

## Desktop manual

- [ ] Review Home and Settings on desktop
- [ ] Saved-game Continue and clear-save actions
- [ ] Rules, completion states, and destructive confirmations
- [ ] Keyboard navigation and visible focus
- [ ] High Contrast, Simple Mode, Reduced Motion, Extra Large UI, and browser zoom
- [ ] Verify Flags keyboard focus and 200% zoom reflow

## Mobile and tablet manual

- [ ] Narrow layouts around 320px and 375px, plus tablet layout
- [ ] Touch controls, page/game scrolling, and portrait/landscape use
- [ ] Larger text and game-piece settings

## Accessibility manual

- [ ] Physical keyboard
- [ ] NVDA
- [ ] VoiceOver
- [ ] TalkBack where available
- [ ] Browser zoom at 200–400%
- [ ] Flags screen-reader announcement and results review
- [ ] Verify Reverse neutral option labels before answering and selected/correct announcements afterwards; assess nonvisual limitation

## PWA and device

- [ ] Chromium installation and standalone launch
- [ ] iOS Add to Home Screen and standalone launch
- [ ] Offline launch, navigation, and play after the offline copy is ready
- [ ] Flags offline reload, full round, replay, and local flag rendering
- [ ] Verify Reverse choices load from the cached local flag assets while offline
- [ ] Offline save, reload, and resume
- [ ] Update-ready message and user-controlled update

## Data safety

- [ ] Resumed game state and completed-game statistics persist after reload
- [ ] Accessibility settings persist after reload
- [ ] Updating preserves saves, statistics, and settings

## Release

- [ ] Production URL serves the intended build
- [ ] Icons, manifest, title, description, and theme metadata are correct
- [ ] No product-caused console errors or failed local asset requests
