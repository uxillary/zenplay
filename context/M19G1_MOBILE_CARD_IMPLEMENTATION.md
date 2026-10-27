# M19G.1 — Mobile Card Composition Implementation

## Files changed

- `src/games/solitaire/ui/CardView.tsx`: Simplified A–10 render one solid SVG suit at the lower right and one upper-left index. Simplified J/Q/K render the original English-pattern asset in the approved B Portrait window (`viewBox="85 30 245 280"`). Traditional retains its existing full court image, multi-pip placement and two indices. Card interactions and accessible names use the existing paths.
- `src/styles/tailwind.css`: Applies the prototype's card-relative suit placement, portrait window, rank and suit sizing, transparent numbered index, fitted white court index, and 10 spacing. Simplified tableau exposure accommodates the complete index; Traditional spacing remains unchanged. Large Print has its own Simplified index size and exposure.
- `src/games/solitaire/ui/cardArtwork.test.ts`: Checks Simplified composition, Traditional preservation, court asset reuse and interactive card labelling.

`SolitaireScreen.tsx`, appearance settings, card assets, rules and saved-game formats did not need changes. They already pass the face preference through stock, waste, foundations, tableau, drag preview and Appearance preview via `CardView`.

## Prototype translation

The live Simplified cards use the approved [prototype](M19G1_MOBILE_CARD_PROTOTYPE.html) suit paths and card-relative dimensions: a 70% square lower-right suit with 2px margins; a top-left rank with a 0.7em suit below; and a B Portrait court window at left 24%, top 32%, width 74%, height 65%. The court image keeps its 360 × 540 proportions inside the 245 × 280 crop. The source SVG files were not edited.

## Verification

- `npm test`: 205 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.
- Focused `cardArtwork.test.ts`: 5 passed after the final composition edits.

Actual gameplay screenshots were not captured. The in-app browser timed out connecting to the local Vite server, and the desktop browser did not expose a usable automation window. The approved prototype PNGs provide rendered design evidence, but they do not establish live-game visual acceptance.

## Remaining owner-device checks

At 320, 360, 390 and 430px, and on desktop:

1. Start a game and inspect stock, waste, foundations, tableau and the Appearance preview. Check A–10, especially 10♠, and J♠, Q♥ and K♦ for clipping or overlap.
2. Build long tableau stacks. Confirm each rank and corner suit remains exposed, cards do not move unexpectedly during moves, and the board has no horizontal overflow at normal zoom.
3. Switch Simplified and Traditional during an active game. Check both Classic and Large Print, then High Contrast and browser zoom. Confirm Traditional still has its complete multi-pip and two-index layout.
4. Use tap, drag/drop, Undo and Hint. Tab through cards to check focus, and verify that a screen reader still announces card names and selection state. Resume a saved game and confirm the face preference persists.

Device acceptance remains pending these checks.
