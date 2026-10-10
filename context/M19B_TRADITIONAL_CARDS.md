# M19B — Traditional playing cards

## Artwork and licence

The 52 card faces come from Dmitry Fomin's *English pattern playing cards deck.svg*, published on Wikimedia Commons as the creator's own work under the **CC0 1.0 Universal Public Domain Dedication**. Commons identifies the author and licence on the [deck page](https://commons.wikimedia.org/wiki/File:English_pattern_playing_cards_deck.svg); CC0 permits copying, adapting and redistribution without attribution requirements ([licence deed](https://creativecommons.org/publicdomain/zero/1.0/)). ZenPlay credits the artist here as a courtesy and does not imply endorsement.

Each card face in `public/cards/english-pattern/` is an individual SVG extracted from the corresponding card group in that complete deck. The source has 13 ranks across four suits, including mirrored English-pattern Jacks, Queens and Kings and traditional pip layouts. The deck art is used unchanged. `back.svg` is a new ZenPlay design: a symmetric blue lattice and rosette with a white frame.

## Implementation

`CardView` maps the existing card rank and suit to one SVG face. A decorative image keeps an empty alt text and is hidden from assistive technology; the existing button label, selection, drag/drop, touch and keyboard behavior remains in place. Face-down cards use the shared back SVG. Cards keep M19A's responsive dimensions, with the deck's 2:3 artwork contained inside the existing 5:7 card box so it stays undistorted. The rank and suit corners remain legible above the artwork.

No Solitaire rules, save formats, settings or other games were changed.

## Verification

- Parsed all 53 shipped SVGs (52 faces and one back) as XML.
- `npm test`: 192 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; the PWA build precaches the SVG assets.
- Inspected the Queen of Spades source at full size and a source-only 41-by-58-pixel render enlarged 10× for inspection. The mirrored portrait, corner indices and suit symbol remain distinguishable at card size. The final app overlay was not browser-rendered in this run.

The local app could not be opened in a browser during this run: the sandbox denied localhost socket access. I therefore could not capture the requested app screenshots or recheck the board at 320, 360, 390, 404, 430 or desktop widths. M19B leaves M19A's card dimensions and board layout unchanged, but M19B viewport screenshots and physical-device checks remain unverified. The build and asset integrity checks do not establish visual overflow behavior.
