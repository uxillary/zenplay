# M19F — Solitaire visual consistency and feedback polish

## Feedback finding and changes

The source does default `solitaireVerboseFeedback` to `false`. `parseSettings` supplies that default for older records and validates booleans. `AccessibilityProvider` loads and persists the setting, and the Solitaire toolbar uses it to gate visible selection and action text. An explicit saved `true` survives reload, as intended. No source path was found that forces visible selection text while the effective setting is Off. The owner's browser storage and deployed bundle were unavailable, so the recording cannot distinguish a saved On value from an older deployment. Game Options now displays **Verbose feedback: On/Off** beside the checkbox to make the active state inspectable without overwriting the saved choice.

Feedback uses a fixed-height toolbar line with a much lighter background. Quiet mode keeps routine text out of sight but continues polite screen-reader announcements. Invalid moves remain visible and announced as errors, then clear after 2.8 seconds. Action feedback clears after 3.2 seconds. Requested hints stay visible until dismissed, including “No move found”; hint text was shortened to fit phones more reliably. New Game and win confirmations are unchanged. The fixed line and single-line text prevent feedback from changing board height.

## Numbered-card artwork

Before: A–10 used forty separately extracted CC0 SVG faces. Their suit silhouettes and apparent pip sizes varied, while `CardView` overlaid another pair of corner indices. After: A–10 are drawn as one lightweight, deterministic SVG system in `cardArtwork.ts` and `CardView`. Four vector suit paths serve the central pips, corner suits and empty foundation guides. The ranks use traditional pip counts and upright/inverted layouts, one shared red/black colour system, and CSS corner ranks with an inverted lower-right copy. The central art contains no indices, so it cannot duplicate the CSS corners. Large Print retains its larger corner treatment. No emoji or font glyph is used for pips.

The forty unused numbered SVG files were removed after confirming no application references remained. The twelve traditional English-pattern J/Q/K portraits and three card backs remain unchanged. The court portraits are still credited to Dmitry Fomin under CC0 in `M19B_TRADITIONAL_CARDS.md`; the new pip geometry is ZenPlay code and adds no third-party licence obligation.

## Empty slots and presentation

Foundations show subdued suit silhouettes for suits not yet started, following the model's clubs, diamonds, hearts, spades order. Guides reassign when a different Ace is played, since **any Ace can start any empty foundation**. Empty foundation button labels and How to Play say this explicitly. Empty tableau columns have a subtle card outline and small K. Placeholder art remains decorative; the existing button names and keyboard focus are intact. Card edges and shadows are slightly softer, and the felt uses a restrained radial shade without the repeating stripe texture. Board dimensions and the high-zoom scroll fallback are unchanged.

## Verification and remaining QA

- Focused tests cover default and persisted feedback settings, feedback priority and timing bounds, court asset mapping, pip counts and geometry, dynamic foundation guides, and server-rendered placeholder markup.
- `npm test`: 203 passed; the numbered-card rendering assertion also passed in a focused rerun.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed, including PWA generation; the 40 removed numbered assets are no longer precached.
- `git diff --check`: passed.

The local Vite server started, but the single in-app browser attempt to open `http://127.0.0.1:5237/` failed with `net::ERR_CONNECTION_TIMED_OUT`, matching the earlier sandbox restriction. No M19F screenshots or actual mobile/desktop rendering checks are available, and no physical device was tested. Owner QA remains necessary at 320, 360, 390 and 430px plus desktop: check rank/suit readability in overlapping and long stacks, card moves and Undo, drag/drop, Hint, both feedback states, persistence after reload, High Contrast, Large Print, reduced motion, and the existing high-zoom fallback. The source and automated checks cannot establish visual acceptance at those widths.
