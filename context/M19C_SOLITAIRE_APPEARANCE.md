# M19C — Solitaire appearance

## Changes

Solitaire's Rules dialog now includes an **Appearance** section with labelled table colour, card style and card back controls. Changes update the board and its small Queen, 10 and card-back preview immediately. The controls stay inside the existing dialog and do not change other games.

| Preference | Options | Default |
| --- | --- | --- |
| Table colour | Classic Green, Midnight Blue, Burgundy | Classic Green |
| Card style | Classic, Large Print | Classic |
| Card back | Classic Blue, Traditional Red, Simple High Contrast | Classic Blue |

The green felt and 52 English-pattern card faces remain the default. Midnight Blue and Burgundy use scoped felt colours with the same restrained texture. Large Print enlarges the overlaid rank and suit corners and exposes more of each face-up tableau card; card width and the M19B.2 high-zoom scroll fallback are unchanged. The red back is a recolouring of ZenPlay's custom blue lattice design. The simple high-contrast back is a new symmetrical black-and-white SVG. The original CC0 faces and original blue back were not edited.

## Persistence and accessibility

The three preferences are stored in the existing local `zenplay-settings` record. Settings schema version 3 adds these fields; parsing older unversioned or version 2 records supplies the three defaults while preserving existing preferences. Unsupported stored values fall back safely. Saved Solitaire games and statistics use separate records and were not migrated or changed.

The existing global High contrast setting remains the only contrast preference. Within Solitaire it strengthens card edges and placeholders, uses dark red and black card indices on white, and keeps selected, drop-target and keyboard focus indicators visible. The white text on the three felt colours has calculated contrast ratios of approximately 7.25:1, 11.07:1 and 9.81:1 respectively. The new selects are included in the shared game dialog's keyboard focus loop. The preview has one descriptive accessible name; its decorative card images remain hidden from screen readers. Reduced-motion handling is unchanged.

## Verification

- Focused settings tests cover defaults, older settings migration, invalid values, local persistence and both non-default table choices.
- `npm test`: 193 passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed, including PWA generation. Both new backs appear in the build output.
- `git diff --check`: passed.
- The original and both new back SVGs parsed as XML. Source-level sizing inspection confirms the seven-column card-width calculation remains unchanged at normal mobile widths, and the existing scroll fallback remains active at CSS widths of 300px or less.

The local Vite server started, but the in-app browser timed out opening `http://127.0.0.1:5237/`. No rendered screenshot or physical-device check was possible in this environment. Owner QA remains: inspect all three felt colours, both card styles and all backs at 320, 360, 390, 400 and 430px and desktop; confirm real card overlap, high browser zoom, large UI scale, Simple Mode, high contrast, keyboard focus, screen-reader names and touch interactions. The prior M19B visual acceptance also remains conditional.
