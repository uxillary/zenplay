# M19A — Solitaire mobile layout

## Changes

- The Solitaire board uses its available felt width to size seven columns and all top piles together. Cards keep a 1:1.4 playing-card ratio, with a desktop size cap. The same CSS dimensions drive tableau offsets and drag previews.
- Mobile Solitaire uses an edge-to-edge felt surface, a shorter Games button, a compact action bar, and quiet Moves/Time text. The horizontal-scroll instruction is gone; keyboard guidance remains in the tableau's accessible description and in Rules.
- Face-up overlap leaves rank and suit visible. Tall stacks increase page height so the final card remains reachable. The board has no horizontal scrolling.
- The mobile shell changes apply only while Solitaire is open. Court-card artwork and game logic were not changed.

## Browser QA

Headless Microsoft Edge at 800px viewport height. Each row had seven visible tableau columns; stock, waste, and all four foundations fitted. Page scroll width equalled viewport width, and neither card row overflowed horizontally.

| Viewport | Card width | Tableau / row width | Evidence |
| --- | ---: | ---: | --- |
| 320px | 41.36px | 308.81px / 309px | [Screenshot](M19A_final_320.png) |
| 360px | 47.08px | 348.81px / 349px | [Screenshot](M19A_final_360.png) |
| 390px | 51.30px | 378.31px / 378px | [Screenshot](M19A_final_390.png) |
| 404px | 53.23px | 391.91px / 392px | [Screenshot](M19A_final_404.png) |
| 430px | 56.72px | 417.13px / 417px | [Screenshot](M19A_final_430.png) |
| 1280px | 88px | 869.22px / 869px | [Screenshot](M19A_final_1280.png) |

The 320px and 390px checks were repeated with large cards, extra-large UI text, high contrast, reduced motion, and draw-three enabled: [320px screenshot](M19A_settings_320.png), [390px screenshot](M19A_settings_390.png). The controls wrap at 320px with extra-large text, while all piles remain visible without horizontal scrolling.

A separate complete-deck, 26-card face-up tableau fixture at 320px produced a 1,038px document. Scrolling 238px placed the last card at 789px in the 800px viewport: [bottom-of-stack screenshot](M19A_long_bottom_320.png). This fixture was used only in an isolated browser profile and did not alter the game rules.

Browser interaction checks confirmed touch selection, Enter to cancel selection, stock draw and Undo for draw-one and draw-three, the Rules dialog, and accessible names for stock, waste, foundations, and all seven tableau columns. Shared component defaults and Solitaire-only CSS selectors limit changes to other games; other games were not visually inspected.

## Automated checks

- `npm test`: 192 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed (existing Browserslist age notice).
- `git diff --check`: passed.

No physical device was tested. Safe-area behavior was reviewed in CSS but was not tested on a device with a notch or home indicator.
