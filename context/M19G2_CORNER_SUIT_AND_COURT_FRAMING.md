# M19G.2 — Corner suit and court framing

## Changes

- `src/styles/tailwind.css`: increased only the Simplified corner suit from `0.70em` to `0.86em` (22.9%). Rank typography, two-pixel rank-to-suit margin, transparent A–10 index, fitted white court backing, and lower-right hero suits remain unchanged.
- `src/games/solitaire/ui/CardView.tsx`: widened the Simplified court source view from `85 30 245 280` to `70 0 280 345`, preserving the source illustration's proportions while including more crown and costume detail. A white vector mask covers the original source's upper-left rank and suit within this portrait only. Its right edge is fitted to each suit's source index; the source SVGs and Traditional rendering remain unchanged.
- `src/games/solitaire/ui/cardArtwork.test.ts`: checks the portrait and source-index mask for all 12 courts and confirms that Traditional courts still render the untouched source with both indices.
- `context/render-m19g2-cards.cjs`: generates reproducible before/after SVG-rasterized comparison sheets from the approved source assets.

The English-pattern source SVGs mix index paths with character paths in different group structures across the 12 courts. A common group extraction would remove costume details on some cards. The fitted white mask isolates the source index without editing those files. The portrait remains in the same lower-right area; the wider source view is a conservative framing choice that shows more of each character. A thin horizontal line from the source card's own illustration border remains visible at the portrait's top edge.

## Visual verification

- [320px comparison](M19G2_CARD_COMPARISON_320.png): 41.0 × 57.4px cards.
- [390px comparison](M19G2_CARD_COMPARISON_390.png): 51.0 × 71.4px cards.

Both PNGs were rendered with Sharp from the original court SVGs and current card composition geometry, then inspected at native size. They show before and after for 10♠, 7♥, all 12 J/Q/K combinations, and a four-card overlapping tableau stack. The larger corner suits remain distinct below the ranks, including on the 10. The original source rank and suit do not appear as fragments in the revised portraits. The wider portrait view keeps faces and crowns intact in the rendered set. These are card-composition renders, not screenshots from live gameplay.

## Automated verification

- `npm test`: 205 passed, 0 failed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.

## Remaining owner-device checks

Live browser gameplay capture was unavailable in this environment. On a device, check 320px and 390px in stock, waste, foundations, and a long tableau stack; inspect 10♠, 7♥, J♠, Q♦, and K♦ at normal zoom. Switch Simplified and Traditional during play, repeat with Large Print, and confirm focus, spoken card names, drag/drop, Undo, Hint, and saved-game restore. Confirm no horizontal overflow or layout jump during moves.
