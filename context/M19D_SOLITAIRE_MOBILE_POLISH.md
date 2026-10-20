# M19D — Solitaire mobile gameplay and interface polish

## Improvements

- The Solitaire shell is narrower on desktop and more compact on phones, leaving the felt board as the main surface. The phone header keeps **Games** navigation and a smaller Solitaire title. Safe-area padding and the board's natural vertical scrolling remain in place.
- New Game, Undo, Hint and Menu form one four-column phone action row. Each has a visible label, a simple decorative icon and an accessible button name. On desktop the controls sit in a compact horizontal row. The left-handed preference mirrors their visual order without moving them below a long tableau.
- A reserved line in the toolbar shows moves and time, or contextual feedback for a selection, invalid move, hint or undo. Selection no longer inserts a banner that moves the board between taps. Undo feedback clears after a short delay. Auto-finish is available from Menu when the existing plan is valid.
- Menu opens separate **How to Play**, **Appearance** and **Game Options** dialogs. Appearance retains M19C's three table colours, two card styles, three backs and live preview. Game Options exposes the existing draw preference for *new* games, timer and count preferences, and local statistics. A resumed or current game keeps its saved draw mode. Simple Mode continues to hide counts and statistics.
- Empty foundations show a decorative **A** and empty tableau columns show **K**. Focused tableau cards rise above overlapping cards while focused. The high-contrast card borders, focus rings, selected and hint indicators remain. A drag clears the old hint, and an unsuitable double-tap now gives invalid-move feedback.

## Behaviour and accessibility

The seven-column card-width formula, M19B.2 high-zoom horizontal scroll fallback, M19C appearance data, the 52 traditional face SVGs, rules, deal generation, undo logic, save format and statistics storage are unchanged. No fixed controls cover cards. Long tableau stacks still extend the page vertically. The dialog focuses the **How to Play** heading first so instructions open at the beginning; its keyboard focus loop and Escape dismissal remain available.

At 320px CSS width, the seven-column formula yields cards about 41px wide before browser-specific rounding. This is the trade-off that keeps every column visible at normal zoom. The cards remain taller than they are wide, with keyboard access and the wider-card scrolling fallback at strong zoom. Physical touch comfort at 320px still needs owner testing.

## Verification

- Focused regression coverage added for selected-card feedback, including face-down card privacy.
- `npm test`: 194 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed, including PWA generation.
- `git diff --check`: passed.
- Source sizing calculations at normal UI scale give approximate card widths of 41, 47, 51, 53 and 57px at 320, 360, 390, 400 and 430px viewports. This checks the seven-column arithmetic, not rendered overflow. The existing fallback remains at effective CSS widths of 300px or less. No other game screen or card-face asset changed.

The local Vite server started, but the single in-app browser attempt to open `http://127.0.0.1:5237/` failed with `net::ERR_CONNECTION_TIMED_OUT`. No M19D browser screenshots or physical-device results are available. The owner still needs to inspect 320, 360, 390, 400 and 430px portrait widths, a landscape phone and desktop; test all appearance choices, browser zoom, Large Print, High Contrast, Simple Mode and left-handed controls; and exercise tap selection, tap-to-move, double-tap, drag/drop, Undo, Hint, Auto-finish, keyboard focus and screen-reader announcements on the rendered game. Visual acceptance remains conditional until those checks are completed.
