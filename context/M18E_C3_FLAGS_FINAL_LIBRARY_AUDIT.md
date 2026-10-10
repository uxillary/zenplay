# M18E-C3 Flags final library and accuracy audit

Audit date: 10 October 2026

## Coverage

Added 63 hooks to the previous 130, for **193 of 195 countries (98.97%)**. Afghanistan (`af`) and Syria (`sy`) remain playable and return the existing safe `undefined` fallback because the current status of their local artwork needs a product decision or a separate asset update.

| Region | Added in C3 | With hooks | Countries | Coverage |
| --- | ---: | ---: | ---: | ---: |
| Europe | 18 | 44 | 44 | 100% |
| Asia | 11 | 46 | 48 | 95.83% |
| Africa | 20 | 54 | 54 | 100% |
| Americas | 11 | 35 | 35 | 100% |
| Oceania | 3 | 14 | 14 | 100% |
| **Total** | **63** | **193** | **195** | **98.97%** |

New IDs:

- Europe: `ad by ba bg ee hu ie lv li lt lu mt mc me mk md sm va`
- Asia: `am az bh cy kp ge tj tl tm uz ps`
- Africa: `cv cf td km cg dj gq er ga gm gn gw ly mr mu st so ss sd zw`
- Americas: `ag dm do gd gy ht kn lc vc sr ve`
- Oceania: `mh nr tv`

Final categories are 137 visual, 42 symbol, 13 comparison, and 1 country. The library uses the existing typed model and lookup. No runtime network, question weighting, or country data changes were made.

## Source and asset methodology

The bundled flags are attributed to `svg-country-flags` v1.2.10; the package lists Wikipedia as its artwork source and was published on 14 January 2021 ([package page](https://www.npmjs.com/package/svg-country-flags), [version history](https://security.snyk.io/package/npm/svg-country-flags/versions?page=1)). Its age prompted a targeted change review; age alone was not treated as proof that any specific image is wrong.

The country registry maps to 195 same-code local SVGs. The existing all-assets test passed: every canonical country resolves to a unique, parseable, self-contained SVG, with no missing or extra country assets. A separate pass parsed positive `viewBox` dimensions for all 195 SVGs. The library uses multiple ratios (including square, 3:2, and 2:1 designs); these values were recorded as a sanity check, not as proof that every flag matches its official construction specification. All 63 newly hooked designs were inspected against their local artwork and a country-specific reference. Sixty relevant FOTW pages loaded in this review; Ireland, Malta, and São Tomé and Príncipe pages returned tool errors, so the new hooks cite official government sources for those three instead. Official sources were also preferred for specific claims where available.

This is a focused discrepancy review, not a claim that every SVG was independently authenticated against a current official construction sheet. No SVG was edited or replaced.

## Afghanistan (`af`): representation remains unresolved

The local SVG depicts the Islamic Republic-era black, red, and green vertical tricolour with its state emblem. Afghanistan's Ministry of Justice still hosts the 2004 Constitution, whose Article 19 describes that three-colour flag ([Ministry of Justice constitution](https://moj.gov.af/en/enforced-constitution-afghanistan)). The current de facto authorities use and describe the white Islamic Emirate flag; the Ministry of Justice reported raising white Emirate flags in 2026 ([Ministry of Justice report](https://moj.gov.af/dr/node/4911)). The UN Credentials Committee record describes competing communications about who represented Afghanistan and deferred its decision ([UN Credentials Committee report, A/78/605](https://documents.un.org/access.nsf/get?DS=A%2F78%2F605&Lang=E&OpenAgent=)). Russia recognised the Taliban government in July 2025, so diplomatic recognition is no longer accurately described as absent ([Associated Press](https://apnews.com/article/3932240270463715f0338c0812cbe5a8)).

The registry explicitly says its 195 ISO-code convention does not assert contested sovereignty; it does not settle which flag convention the game should use. **Recommendation: defer a flag-choice decision pending owner direction, and retain the existing SVG with this documented historical-design limitation in the meantime.** Do not add a hook until the intended representation is decided. Classification: **P2 — unresolved representation choice**, not a demonstrated error in the historical artwork.

## Other artwork discrepancies

| Country | Finding | Evidence and severity | Recommended action |
| --- | --- | --- | --- |
| Syria (`sy`) | **Confirmed outdated design.** The local SVG is the red-white-black flag with two green stars used under the former Assad government. The UN raised Syria’s new green-white-black flag with three red stars on 25 April 2025 ([UN flag ceremony](https://webtv.un.org/en/asset/k1w/k1wk7g2zfp), [UN Security Council record](https://digitallibrary.un.org/record/4081326/files/S_PV.9904-EN.pdf)). | The source package predates the change. This is a material current-flag mismatch. **P1 — must resolve before release** for an educational flag game. | In a separately approved asset-remediation milestone, replace with a vetted current asset and verify attribution/provenance. C3 intentionally leaves the SVG unchanged and adds no Syria hook. |
| Kyrgyzstan (`kg`) | **Confirmed outdated design.** The local SVG contains the pre-2023 wavy sun rays. Kyrgyzstan’s 22 December 2023 Law No. 208 changed the rays to straight ones; the country-specific reference records the change and current description ([Kyrgyz Ministry of Justice law record](https://cbd.minjust.gov.kg/4-5235/edition/953/ru), [FOTW entry](https://www.fotw.info/flags/kg.html)). The existing hook describes the central crossed lines, which remain a useful general cue. | Minor but visible geometry difference. **P2 — follow-up improvement.** | Update the art in the separate asset-remediation milestone; no hook correction is needed now. |
| Honduras (`hn`) | **Potential colour discrepancy.** Local SVG bands use `#0073cf`. The Honduran TSC quotes the 1949 decree specifying turquoise blue, while a 2023 Education Ministry publication discusses disagreement over “turquoise” versus darker blue. The retrieved official material does not establish a single exact digital colour standard ([TSC account](https://www.tsc.gob.hn/index.php/2024/09/01/en-acto-solemne-el-tsc-rindio-tributo-a-la-bandera-nacional-en-su-dia/), [Education Ministry publication](https://www.se.gob.hn/media/files/coleccion_civica/documentos/Catedra_del_Himno_Nacional_de_Honduras_1.9.23.pdf)). | The five-star layout and stripes remain recognizable; exact shade needs authoritative clarification. **P2 — follow-up review**, not a confirmed defect. | Confirm the current production colour against an authoritative current specification before changing the SVG. The existing hook concerns the five-star arrangement and remains accurate. |

## Editorial and comparison review

All 130 existing hooks and 63 additions were reviewed for fit to the local artwork, clarity, length, source presence, and comparison references. New hooks are concise visual cues or directly depicted symbol names, without invented meanings. Existing country IDs and categories were preserved except for one safe editorial correction: the United Kingdom hook now describes the crosses and saltires visibly present on the Union Flag, removing the imprecise phrase “joined under one sovereign”. It is now categorised as visual rather than symbolic.

All comparison targets resolve to canonical country IDs. The two C3 additions compare Luxembourg with the Netherlands by the shade of blue, and Monaco with Indonesia by proportions; neither describes the designs as identical. Existing comparisons were retained after review. The test suite checks canonical references, uniqueness, word lengths, categories, sources, and the missing-hook fallback. Source URLs are editorial references only; the game remains fully local and offline-capable.

## Bundle and verification

The main JavaScript chunk is **598.41 kB**, up **9.97 kB** from M18E-C2’s 588.44 kB. This is proportionate to 63 more concise hooks and source metadata. Vite continues to report its existing 500 kB chunk advisory; Browserslist reports that `caniuse-lite` is eight months old. A future application-level performance milestone could assess lazy-loading the Flags learning module; no code splitting is included here.

- `npm test`: passed, 190 tests; 190 passed, 0 failed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; 149 modules transformed, 212 files precached (3,214.00 KiB).
- `git diff --check`: passed. Git emitted its line-ending conversion notices for the two edited TypeScript files.
- The all-country asset test confirmed 195 mapped local SVGs parse and no extra country flag files exist. The viewBox audit found 195 positive, parseable dimensions and no invalid entries.

No browser, device, screen-reader, or real offline runtime checks were performed. Existing release checklist items for those checks remain open.

## Release readiness and next action

- **P0:** None found.
- **P1:** Syria’s confirmed outdated artwork must be resolved before release; prepare a separately approved, source-verified replacement.
- **P2:** Afghanistan’s intended representation needs an owner decision; Kyrgyzstan needs its post-2023 geometry; Honduras needs authoritative colour clarification.

Next milestone: focused flag-asset accuracy remediation for Syria and Kyrgyzstan, plus owner decisions for Afghanistan and the Honduras colour standard. Keep the two hook exceptions playable with `undefined` learning content until then. This completes M18E-C3; no remediation is started here.
