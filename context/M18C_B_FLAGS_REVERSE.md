# M18C-B Flags Reverse mode

## Rules and engine reuse

Flags setup now offers Classic, Practice, and Reverse, each with a short description. Classic + All countries remain the defaults. Mode and region changes only update the setup selection; Start game creates a session with a fixed mode and region. Replay uses that same mode and region, Back to setup allows a new selection, and Back to Games keeps existing GameShell navigation.

Reverse shows **Which is the flag of {country}?** and four local SVG flag choices. It reuses `FlagQuestion`, `createFlagRound`, `createFlagsGameState`, `submitFlagsAnswer`, and `continueFlagsRound`; the existing country-based answer state stays direction-neutral. Therefore Reverse shares Classic's ten unique correct countries, four shuffled choices, score, answer lock, explicit continuation, tenth-question results, and replay. It does not use Practice's retry queue or introduce separate scoring logic.

The selected region is passed to the shared round generator. Both the correct country and all three distractors are drawn from that pool. Existing M49 groups and 195 country IDs are unchanged; local SVG paths are the existing `/flags/{id}.svg` files.

## Reverse presentation

The reverse choices use a responsive two-column grid. Each native button holds a rounded neutral card with an image sized in a fixed image frame using `object-fit: contain`, which preserves the source SVG proportions and keeps the outer card sizes aligned. The flag itself is not cropped or rounded. Selected and correct choices receive outlines, distinct colors, and visible text status; feedback names the correct country and describes the selected answer. Answer buttons lock after selection and focus moves to Next flag or See results.

## Accessibility and limitation

Before answering, each button has a neutral, positional name: **Flag option 1** through **Flag option 4**. The SVG has empty alt text and is hidden from assistive technology; its country ID, filename, and country name are not used as a pre-answer accessible label or tooltip. After answering, the option labels and visible card status distinguish the player's choice and the correct choice. The polite status feedback states the correct country. Setup options remain keyboard-operable pressed-state buttons; focus is not moved just by changing a mode or region.

I assessed a text-label alternative. Naming a flag option with its country would reveal the answer before submission. Keeping the names neutral avoids that leak but does not let a nonvisual player distinguish the flag images. No misleading textual substitute or answer-revealing control was added. Reverse is keyboard operable, but it is an inherently visual recognition activity and is **not fully playable nonvisually**. Any later alternative would need a reviewed, meaningful description for each flag that does not name the country.

## Verification

- `npm test` — passed, 178 tests, including Reverse question reuse, randomized/deterministic generation, region filtering, answer locking, scoring, completion, replay reset, neutral option labels, and answer-state names. Existing Classic, Practice, country/region, SVG, and navigation tests remain.
- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed on retry after a transient `EPERM` while Vite resolved `index.html`; 212 PWA precache entries (3,181.44 KiB). The generated service worker lists all 195 local flag SVG paths.
- `git diff --check` — passed; Git noted an LF-to-CRLF working-copy warning for the existing `src/components/GameCard.tsx` change.
- Build warnings: the main JavaScript chunk is 566.76 kB minified (above the 500 kB advisory threshold), and Browserslist's `caniuse-lite` data is eight months old.

## Responsive and offline checks

Responsive inspection at 390px, 360px, 320px, desktop width, and 200% zoom is **NOT VERIFIED**. The latest production preview started at fresh port 4175, but the in-app browser timed out opening it. The previous preview origin at port 4173 displayed an old seven-game build; the cause could not be confirmed because browser storage and service-worker inspection were unavailable. No production PWA caching settings were changed.

Offline runtime is **NOT VERIFIED**. The production build includes all existing local flag SVGs in the precache, and Reverse references those local files, but service-worker install, offline reload, and an offline Reverse round were not exercised in a browser. Manual keyboard and screen-reader behavior also remain **NOT VERIFIED**; the automated tests check the intended accessible labels and state transitions, not an AT session.

## Remaining release blockers and next milestone

The implementation and automated checks are ready for release-focused review, but the pending browser, device-size, zoom, assistive-technology, and offline checks remain release blockers. Keep the corresponding items open in `RELEASE_CHECKLIST.md`.

Recommended next milestone: focused Flags release QA in a fresh browser context with preview access, including all three modes, every region choice, 390px/360px/320px and desktop layouts, 200% zoom, keyboard and screen-reader review, and a production offline round. Do not add another Flags mode before that review.
