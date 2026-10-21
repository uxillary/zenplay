# M19F.2 — Solitaire layout stability

## Finding

The tableau is in normal document flow. `PileView` gives each column a spacer whose height depends on the last card's offset. Moving or undoing cards can therefore make the page cross the vertical-scrollbar threshold. The app panel, game shell and felt have no fixed height or vertical overflow; the document (`html` in this standards-mode page) is the vertical scroller. The `main` element has `overflow-x-hidden`, which computes a vertical `auto` overflow, but its auto height grows with its contents rather than forming a separate height-limited scrollport. At extreme zoom, each `.zen-card-row` is independently scrollable **horizontally** so all piles stay reachable.

When a classic-width document scrollbar appears, the usable viewport width shrinks. That can move the centered panel and felt; at widths where the felt is fluid, its container-query-based card width can shrink too. A reverse move can undo both changes. Browser scroll anchoring may additionally adjust the vertical scroll position when cards inside a tall tableau change. These are source-supported causes of the reported jump; the recording and live browser geometry were unavailable in this workspace, so the exact contribution of each could not be measured.

The drag preview is fixed-positioned and does not contribute to layout height. Solitaire does not call `focus()`, `scrollTo()` or `scrollIntoView()` during card moves. The shared dialog and app navigation have focus management, but ordinary tap-to-move, drag/drop and Undo do not invoke it. The felt's container query responds to its width; the scrollbar-width change can feed into that calculation, while the card height itself does not alter the container's width.

## Change

In `src/styles/tailwind.css`, `scrollbar-gutter: stable` now reserves scrollbar space on the document while Solitaire is open. Browsers without that property use `overflow-y: scroll` as a fallback. Both rules are scoped through the Solitaire app-frame class so other screens keep their current layout. `overflow-anchor: none` on the felt prevents card elements from becoming document scroll anchors during pile-height changes. Vertical page scrolling and the existing high-zoom horizontal pile scrolling remain enabled. No card dimensions, rules, artwork, saved games, focus styles or interactions were changed.

## Verification

| Check | Result |
| --- | --- |
| Existing tests | `npm test`: 203 passed |
| TypeScript | `npm run typecheck`: passed |
| Lint | `npm run lint`: passed |
| Production build | `npm run build`: passed |
| Patch whitespace | `git diff --check`: passed |
| Browser and screenshot access | Unavailable. The in-app browser timed out on `http://127.0.0.1:5173/`; shell access to that local socket was denied; headless Edge yielded no DOM even for a `data:` page. |

The width fix is deterministic from the CSS: once the root gutter is reserved, crossing the page-scrollbar threshold cannot change the document's content width, so it cannot change the centered felt position or `100cqw` card widths through that route. This is a code-level conclusion, not a measured browser result.

## Owner-device QA still needed

On a browser that can load the game, measure `document.scrollingElement`, felt `getBoundingClientRect().x` and `.width`, and a card's width before and after moves that grow and shrink the tallest tableau, cross the scrollbar threshold, and Undo. Repeat with tap-to-move and drag/drop at desktop, 320px and 390px; check long-stack vertical scrolling, high zoom, visible keyboard focus and any scroll shift caused by focusing a card. No rendered screenshots or physical-device observations are claimed for this milestone.
