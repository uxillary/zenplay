# M19G — Simplified Solitaire Card Faces

## What changed

Solitaire now defaults to Simplified card faces. A–10 show one large central suit with bold corner indices. The Appearance dialog offers Simplified and Traditional card faces. The existing Large Print card style remains a separate preference. J/Q/K continue to use the same English-pattern artwork in both modes.

## Implementation and settings

`CardView` reuses the existing solid SVG suit paths. Simplified mode renders one central suit path; Traditional mode retains the existing multi-pip placements. The face preference is passed to the board, tableau, drag preview, and Appearance preview, so changing it updates the current game immediately without changing game state.

`solitaireCardFaces` is stored with the other app settings. Missing or invalid values resolve to `simplified`; an explicit `traditional` choice survives reload. Existing Large Print, card back, table colour, saves, and statistics use their existing storage paths.

## Before and after visual evidence

[Rendered comparison HTML](M19G_SIMPLIFIED_CARD_FACES_COMPARISON.html) contains 7♠, 10♥, 4♣, and A♦ side by side in Simplified and Traditional modes, plus J/Q/K artwork. It also shows Simplified faces at card widths calculated for approximately 320px and 390px viewports. The file is generated from the actual `CardView` markup with [the comparison generator](render-m19g-comparison.mjs).

| Card | Traditional centre | Simplified centre |
| --- | ---: | ---: |
| 7♠ | 7 spades | 1 spade |
| 10♥ | 10 hearts | 1 heart |
| 4♣ | 4 clubs | 1 club |
| A♦ | 1 diamond | 1 larger diamond |

The automated render tests verify those central path counts and that J/Q/K markup and asset paths are identical between modes. The HTML comparison was generated, but browser security policy blocked opening its local `file:` URL through the available browser tool, so visual inspection in a browser remains for owner QA.

## Verification

- `npm test`: 205 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- `git diff --check`: passed.

## Remaining owner QA

Open the comparison HTML locally and check legibility at 320px and 390px phone widths. In Solitaire, change Card Faces during an in-progress game and verify that the board updates immediately with no lost progress. Check on a physical phone with an older casual player; no physical-device verification was performed here.
