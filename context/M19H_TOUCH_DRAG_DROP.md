# M19H: Mobile touch drag and drop

## Diagnosis

`CardView` used native HTML Drag and Drop (`draggable`, `dragstart`, `drag`, `drop`). Android browsers do not reliably start that drag sequence from a touch contact, so Solitaire's touch interaction fell back to clicks. The existing preview was positioned inside the Solitaire board, whose card rows can scroll horizontally at high zoom. Card positions and z-index were confined to each tableau column. Move validation and selection already supported moving a face-up tableau suffix, but validation did not check that the suffix itself was in descending, alternating-colour order.

## Solution

Face-up cards now use Pointer Events for touch and primary-mouse gestures. Movement of at least 7px starts a drag without a hold delay. Pointer capture keeps the gesture active outside the source card; a fixed, non-interactive portal on `document.body` shows the card or full tableau suffix above the board without affecting layout or receiving drop hits. Pointer positions and drop hit tests update at most once per animation frame. Drop targets use `elementFromPoint` and `data-solitaire-drop`; legal targets are checked with the existing `isValidMove` rules and highlighted during a drag. Valid releases dispatch the existing move action. Invalid releases, pointer cancellation, and lost pointer capture remove the overlay without a move.

Short touch releases call the existing card selection handler. The immediately following compatibility click is consumed so a tap or drag cannot act twice; keyboard-generated clicks remain available. Mouse clicks, tap-to-move, double-tap to foundation, Hint, Undo, screen-reader labels, focus styles, and reduced-motion styling remain in place. `touch-action: none` applies only to draggable face-up card surfaces; the surrounding page and card rows retain their normal scrolling behaviour.

## Verification

- `npm test`: 211 passing. Focused tests cover the threshold, touch and mouse eligibility, legal multi-card and invalid/cancelled drops, one history entry, serialization, Undo, and compatibility-click suppression.
- `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`: passed.
- Local headless Edge used CDP touch events for a legal drag, invalid release, and touch cancellation; a mouse drag also completed. A successful drag created one move, persisted it in IndexedDB, and Undo reversed it. The preview appeared during the drag and disappeared on release/cancel. A short touch selected a card; an injected compatibility click did not toggle it again.
- At 320, 360, 390, and 430px, page width matched viewport width. During a touch drag at 430px, vertical scroll stayed at zero and no overlay remained after release. A simulated 13-card tableau stack at each width increased pile height without increasing page width or reversing card offsets.

## Outstanding device checks

Physical Android touchscreen acceptance remains unverified. Test a real Android browser with short and long tableau stacks, including high zoom and horizontal pile-row scrolling, and confirm that drag, tap, double-tap, cancellation, focus, and page scrolling feel natural. The long-stack browser check above used temporary DOM clones for layout measurement, not a full game-state drag of 13 cards.
