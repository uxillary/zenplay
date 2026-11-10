# M19I — Solitaire mobile acceptance

Review date: 10 November 2026. Recommendation: **CONDITIONAL**. Local browser acceptance and automated checks support the scoped fixes; physical Android, installed-PWA and assistive-technology acceptance remain open. This is not a launch-readiness declaration.

## Scope and initial findings

Reviewed M19A/C/D/E/F.2/G.1/G.2/H documentation, CardView, PileView, SolitaireScreen, responsive/card CSS, GameShell/GameDialog, settings, save validation/queue, move rules, accessibility feedback and existing release checks. M19H's pure tests did not establish complete touch-event or full-deck endgame behaviour. New browser fixtures retain all 52 unique cards and use actual saved-game restoration, rather than cloned DOM stacks.

| Priority | Finding and evidence | Resolution |
| --- | --- | --- |
| P2 | Large Print/High Contrast drag cards lost board-scoped font, border and shadow rules after moving into the body portal. Source/preview computed styles differed. | Extend only the card appearance rules to the drag layer; carry `data-card-style`. Browser assertions compare source/preview font within 0.02px rounding, border and shadow. |
| P2 | The decorative drag preview duplicated card text in the accessibility tree. | Mark the preview layer `aria-hidden`; original buttons and move announcements remain available. |
| P2 | Touch double-tap history used `0` as an initial timestamp, survived cancellation and was not tied to card identity. An early first tap or replacement waste card could be treated as the second tap. | Require a completed preceding tap on the same card; clear history on cancellation and dragging. Reuse the existing movement threshold. |
| P2 | Full-deck endgame with four Kings and four Queen-topped foundations did not offer Auto-finish: redundant King moves to empty columns counted as remaining choices. | Ignore only empty-column repositioning when checking availability. The simulated plan must still complete using legal foundation moves. Other tableau choices still block Auto-finish. Added a full-deck regression. |
| P3 | How to Play omitted dragging after M19H. | Add the drag alternative to the existing controls paragraph. |
| Owner check | At 320px cards are about 41px wide and exposed stack segments about 38px high. Comfort for the target older player requires a physical test. | Preserve approved sizes and composition. Do not shrink cards. Use the owner checklist before sign-off. |

No reproducible P0/P1 defect remains in the tested scope. No artwork, move-validation rules, other games, account systems or monetisation were changed.

## Browser acceptance and evidence

Local Vite development application, headless Edge 157.0.4341.42, CDP touch events and native keyboard/mouse input. The reusable runner is [verify-solitaire-mobile.mjs](../scripts/verify-solitaire-mobile.mjs). It requires Vite on `127.0.0.1:5173` and a **disposable** Edge/Chrome profile with remote debugging on port 9224; then run `node scripts/verify-solitaire-mobile.mjs`. It replaces Solitaire saves/settings only in that test profile. Measurements are retained in [results.json](M19I_evidence/results.json).

| CSS viewport | Card width × height | Layout result |
| --- | --- | --- |
| 320 | 41.36 × 57.92px | PASS |
| 360 | 47.08 × 65.92px | PASS |
| 390 | 51.30 × 71.81px | PASS |
| 404 | 53.23 × 74.53px | PASS |
| 430 | 56.72 × 79.41px | PASS |
| 768 tablet | 87.91 × 123.08px | PASS; 15px reserved desktop scrollbar gutter |
| 1280 desktop | 88 × 123.19px | PASS; 15px reserved desktop scrollbar gutter |

All seven columns and top piles fit at normal zoom. Mobile page scroll width equalled viewport width; desktop content remained within the reserved gutter. Menus preserved felt x-position and width. Cards retained the 1:1.4 proportion. Controls stayed above the board; quiet statistics did not insert selection banners. A real 13-card saved tableau sequence moved once, persisted once and undid correctly at every phone width. Invalid releases and touch cancellation left history unchanged and removed the overlay. Moves preserved felt width and vertical scroll position. Short touch movement selected a card; tap-to-foundation and native Enter selection/destination activation worked. These checks also compare preview appearance with the original card.

Additional browser cases cover Hint, settings changed through Appearance/Game Options and reloaded, returning after leaving Solitaire, save restoration, desktop mouse dragging, Auto-finish and the win dialog. Rule-level tests cover no-hint states, stock draw/recycle, new deals and move validation. They do not constitute a full human game playthrough.

Screenshots are actual rendered Solitaire, not isolated mockups:

- New game: [320px](M19I_evidence/new-320.png), [390px](M19I_evidence/new-390.png), [desktop](M19I_evidence/new-1280.png).
- Complete saved long stack: [320px](M19I_evidence/long-320.png), [390px](M19I_evidence/long-390.png); [drag at 390px](M19I_evidence/drag-390.png).
- All twelve courts exposed together: [Simplified Classic](M19I_evidence/courts-simplified-classic-390.png), [Simplified Large Print](M19I_evidence/courts-simplified-large-print-390.png), [Traditional Classic](M19I_evidence/courts-traditional-classic-390.png), [Traditional Large Print](M19I_evidence/courts-traditional-large-print-390.png). This visual fixture places courts in all visible pile positions; foundation ordering is intentionally for visual inspection, not a playable endgame.
- Backs: [blue](M19I_evidence/back-classic-blue-390.png), [red](M19I_evidence/back-traditional-red-390.png), [High Contrast](M19I_evidence/back-high-contrast-390.png).
- [Menu](M19I_evidence/menu-390.png), [Appearance](M19I_evidence/appearance-390.png), [High Contrast/Large Print](M19I_evidence/accessible-390.png), [matching drag preview](M19I_evidence/accessible-drag-390.png), [win](M19I_evidence/win-390.png).

Visual inspection of all twelve courts in both face styles and both print settings found no new source-index fragments, overlapping indices or clipped faces requiring an artwork change. The fitted white court backing and approved portrait crop remain. Simplified numbered cards retain the large lower-right suit, enlarged corner suit and clear 10 spacing. Suit silhouettes, backs and quiet placeholders remain consistent. Readability at 320px is visually plausible, but older-player comfort remains an owner decision.

## Accessibility and outstanding acceptance

**PASS in tested scope:** native Enter card selection and destination activation; existing card descriptions and selected state; focus styling visible in the Appearance capture; reduced-motion/high-contrast rendering; quiet defaults; invalid-feedback priority in existing tests. Preview content is now hidden from assistive technology.

**CONDITIONAL:** screenshots at effective 640px and 320px layout widths approximate a 1280px browser at 200% and 400% zoom ([200% equivalent](M19I_evidence/zoom-200.png), [400% equivalent](M19I_evidence/zoom-400.png)). They are viewport simulations, not native browser-zoom or pinch-zoom acceptance. Test actual zoom, full keyboard traversal, spoken announcements and contrast/recognition with the owner's assistive setup. High-zoom row scrolling remains enabled by the existing CSS.

**NOT VERIFIED:** physical Android finger comfort, OS gesture interruption/rotation, edge gestures, installed PWA viewport/chrome/safe-area behaviour, actual offline runtime, TalkBack or another screen reader, and a full human game playthrough. The browser fixtures exercise long-stack moves but do not establish automatic scrolling while holding a drag at the viewport edge. Scroll the page between gestures; assess whether this is comfortable on the device before proposing any new gesture behaviour.

## Automated verification

- `npm test`: **213 passed, 0 failed** (211 baseline plus two focused regressions).
- `npm run typecheck`: **PASS**.
- `npm run lint`: **PASS**.
- `npm run build`: **PASS**, including PWA generation. The existing Browserslist age advisory remains; it did not fail the build.
- `git diff --check`: **PASS**.
- Browser runner: **PASS**; see retained results and screenshots. Development-server browser evidence is distinct from production-build success.

Complete [the owner Android checklist](M19I_OWNER_ANDROID_CHECKLIST.md) before physical-device sign-off. Any failed move, lost progress or inaccessible essential control changes the recommendation to **FAIL** until repaired. Optional visual redesigns require owner approval; none is proposed here.
