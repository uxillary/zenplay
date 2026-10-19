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

## M19B.1 final acceptance — 10 October 2026

**Verdict: CONDITIONAL.** All 52 expected face assets and the card back are present, parse as XML and are included in a successful production build. The 192-test suite, typecheck and lint pass. No temporary M19B scripts, generated source copies or QA pages were present in the repository, so no committed artwork or attribution files needed removal.

Browser QA remains unverified. The sandbox blocks localhost access, and the Windows browser automation guard stopped before navigation because it could not establish the current browser URL. No actual-game or representative-card screenshots were captured in this acceptance run. As a result, corner overlap, crop/alignment, face readability, seven-column fit, horizontal overflow, touch/keyboard interactions and screen-reader behavior have not been visually or interactively accepted at the requested widths. No visual correction was made without rendered evidence. M19B should not be marked fully complete until those browser checks and screenshots are obtained; physical-device testing is also outstanding.

## M19B.2 card scaling and visual acceptance — 19 October 2026

**Verdict: CONDITIONAL.** The owner-provided recording reports clipping at an approximately 400px viewport with increased browser zoom and crowded 10 indices. I could not locate that recording in the workspace or current task attachments. Source inspection confirms the overflow path: the felt board is an inline-size container whose card width shrinks to fit seven columns, while the app shell clips horizontal overflow. At strong zoom, the effective CSS viewport narrows and the cards continue shrinking without a readable lower bound; the two pile rows then have no scroll fallback. The index font also has a fixed rem size, so two-character ranks become crowded as card width shrinks. App text/UI scale increases rem-based text and gaps without increasing the available board width.

The targeted correction leaves the standard-width seven-column sizing formula in place. At effective CSS widths of 300px or less, cards retain a 2.5rem minimum width and the top-pile and tableau rows scroll horizontally as separate regions. A short note appears at that breakpoint, and both regions describe the scroll option to assistive technology. The existing toolbar continues to wrap. Both corner 10s now use a slightly smaller, tighter rank style to reduce crowding while retaining the card’s suit and traditional art. No rules, persistence, or other game code changed.

The local development server started successfully, but the in-app browser timed out opening `http://127.0.0.1:5237/`. The host sandbox also denied localhost socket access in the previous acceptance attempt. Therefore I captured no rendered screenshots and could not verify the breakpoint visually, inspect the cards at actual rendered size, measure overflow at 320, 360, 390, 400 or 430px and desktop, or interactively check touch, keyboard focus, screen-reader output and long-stack reachability. The owner’s recording is evidence of the original issue, not verification of this correction. No physical-device check was possible.

`npm test` (192 passed), `npm run typecheck`, `npm run lint` and `npm run build` passed after the source changes. No temporary M19B QA scripts or generated assets were found; the committed SVG faces, card back and provenance documentation remain intact. Browser screenshots and interaction checks remain required before full acceptance.
