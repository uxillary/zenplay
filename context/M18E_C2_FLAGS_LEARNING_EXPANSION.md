# M18E-C2 Flags learning library expansion

## Coverage

Added 65 hooks to the C1 library, reaching **130 of 195 countries (66.67%)**. The other 65 have no hook and continue to return `undefined`.

| Region | Added | Covered | Total | Coverage |
| --- | ---: | ---: | ---: | ---: |
| Europe | 10 | 26 | 44 | 59.09% |
| Asia | 17 | 35 | 48 | 72.92% |
| Africa | 23 | 34 | 54 | 62.96% |
| Americas | 10 | 24 | 35 | 68.57% |
| Oceania | 5 | 11 | 14 | 78.57% |
| **Total** | **65** | **130** | **195** | **66.67%** |

Final category counts: 78 visual, 40 symbol, 11 comparison, and 1 country.

New IDs by region:

- Africa: `bw na ls sz mw mz ao dz tn sn ml ne cm ci bf bj tg lr sl rw bi cd mg`
- Asia: `kh la mn mm bn ir iq il jo kw lb om qa ae ye mv kg`
- Europe: `at is hr ro rs ru si sk be nl`
- Americas: `bo ec pa cr hn sv gt py tt bz`
- Oceania: `ki fm pw sb vu`

The regional additions match the proposed split. Afghanistan was excluded because its local SVG shows the older tricolour while [the current FOTW reference](https://www.fotw.info/flags/af.html) describes the post-2021 flag; Kyrgyzstan was chosen instead, and [its current FOTW entry](https://www.fotw.info/flags/kg.html) and local SVG agree.

## Editorial and source review

New hooks use short, flag-specific visual cues, in British English. I checked the 65 chosen local SVG files as XML, including their colours, shapes, and emblem artwork, against the descriptions. Each new entry cites a country-specific Flags of the World (FOTW) page; the cited pages were opened during research. Comparison entries cite both flags and use the existing `relatedCountryIds` field.

New comparisons cover Senegal/Mali, Niger/India, Liberia/United States, Kuwait/UAE, Slovenia/Slovakia, and Russia/Netherlands. The two reciprocal hooks for Senegal/Mali and Slovenia/Slovakia each identify the distinguishing feature. Existing hooks were unchanged.

No historical or colour-meaning claims were added. Symbol names describe depicted features. References are editorial metadata only; content stays bundled locally, with no network or gameplay changes.

## Bundle and verification

The main JavaScript chunk is **588.44 kB**, up **10.23 kB** from C1’s 578.21 kB (16.86 kB above the earlier 571.58 kB baseline). The increase is the additional local hook text and source metadata.

- `npm test`: passed, 190 tests.
- Focused memory-hook tests: passed, 7 tests.
- All 65 selected SVGs parsed as XML.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed. Vite reports the existing >500 kB chunk advisory; Browserslist also reports its browser data is eight months old.
- `git diff --check`: passed; Git reports line-ending conversion warnings for pre-existing modified files.

## Remaining uncovered countries

- Europe: `ad by ba bg ee hu ie lv li lt lu mt mc me mk md sm va`
- Asia: `af am az bh cy kp ge sy tj tl tm uz ps`
- Africa: `cv cf td km cg dj gq er ga gm gn gw ly mr mu st so ss sd zw`
- Americas: `ag dm do gd gy ht kn lc vc sr ve`
- Oceania: `mh nr tv`

## Suggested M18E-C3 scope

Curate the remaining 65 countries with the same source and artwork checks. Africa (20) and Europe (18) have the largest remaining groups; Asia has 13, the Americas 11, and Oceania 3. Preserve the current lookup fallback and avoid gameplay weighting or persistence.
