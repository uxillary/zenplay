# M19E — Solitaire interaction and feedback fixes

## Changes

- Added local **Verbose feedback** and **Show possible moves** preferences under Solitaire → Menu → Game Options. Both default to Off, persist independently in the existing settings record, and validate stored values. Version 3 settings migrate to version 4 with draw mode, timer and card appearance intact. The saved-game and statistics formats are unchanged.
- With verbose feedback Off, routine selection, move, Undo and auto-finish messages no longer replace Moves and Time in the toolbar. Invalid-move errors, New Game confirmation and requested Hint text remain visible. A separate polite screen-reader status announces routine selection and action feedback when it is visually hidden. The toolbar retains its reserved context line, so routine feedback does not shift the board. With verbose feedback On, concise move and existing selection/Undo/auto-finish messages appear there.
- With possible moves Off, selecting a card does not add yellow outlines to tableau or foundation destinations. The selected card keeps a slimmer marker; the existing focus ring remains separate. With it On, existing move validation supplies destination outlines. Explicit Hint highlighting and its Dismiss action remain independent of this setting.

## Tableau stacking root cause and fix

Tableau cards render in stack order, but `.zen-card-position:focus-within { z-index: 2; }` raised any focused earlier card above later cards. Focus can remain on the source card after a move or Undo, so a card placed later in a column could appear underneath it. The rule applied only while motion was enabled, making the result dependent on reduced-motion settings. Each tableau wrapper now uses its card index as its layer, and the focus-based override is removed. Drag previews use the same index order. Focus styling stays on the card itself, with an inset ring visible in the exposed rank/suit area; High Contrast retains its stronger focus rule. This also keeps stacking order stable during the existing position and flip animations.

## Verification

- Focused settings tests cover Off defaults, invalid stored values, independent On values, and migration from version 3 without losing appearance or game preferences.
- `npm test`: 195 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed, including PWA generation.
- `git diff --check`: passed.
- Source inspection confirmed that move legality, Hint calculation, rules, deal generation, card artwork, themes, saved-game format and other game screens were not changed. The tableau layering fix preserves the card focus outline and does not clip overflow.

## Outstanding rendered QA

Previous M19B–M19D attempts to open the local Vite app in the in-app browser timed out with `net::ERR_CONNECTION_TIMED_OUT`; M19E did not repeat that same blocked route. No M19E browser screenshot, physical-device interaction, or screen-reader session was available. The owner should confirm quiet and verbose play, both highlighting settings, explicit Hint, tap-to-move, drag/drop and Undo stacking, long columns, keyboard focus, High Contrast and reduced motion on mobile and desktop. In particular, verify the inset focus ring remains obvious on a covered card's exposed top edge and that the selected marker is visible at narrow phone widths.
