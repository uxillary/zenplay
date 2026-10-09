# ZenPlay release checklist

Complete the manual and release items against the production build and deployment target. Do not mark a device check complete without testing that device.

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
