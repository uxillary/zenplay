# M18F Flags asset remediation

**Audit date:** 10 October 2026  
**Scope:** targeted flag artwork only; no country dataset or game mechanics changed.

Learning-hook coverage is now **194/195 countries (99.49%)**. Syria's hook was added, Kyrgyzstan's existing hook was updated, and Afghanistan remains the sole hook exception. All 195 country-to-local-SVG mappings remain playable.

## Syria (`sy`) — corrected

The previous asset showed the red–white–black design with two green stars. Syria's 13 March 2025 Constitutional Declaration, Article 6, specifies three equal green, white, and black rectangles, with three red stars in the white band. Syrian Arab News Agency (SANA) reports this flag in current use at official buildings and embassies, and describes the stars in a straight line; its account of the 1928 Constitution specifies five-pointed stars. Sources: [Constitutional Declaration, Article 6 (English translation)](https://www.refworld.org/sites/default/files/2026-06/sryia_constituional_declaration.pdf), [SANA current flag account](https://sana.sy/es/culture/350973/), [SANA history quoting Article 4 (1928)](https://sana.sy/culture-and-arts/2273533/).

Replaced `public/flags/sy.svg` at the existing path with an independently drawn, self-contained 900×600 SVG: equal horizontal bands, green/white/black, and three red five-pointed stars symmetrically centered in one row on the white band. The current declaration does not define star dimensions or spacing, so those are a symmetric rendering of its centered-row description, not a claimed construction specification. The SVG's digital green and red values (`#007a3d`, `#ce1126`) follow the public-domain current-flag vector; the declaration specifies colour names, not digital values. The 3:2 width-to-height drawing is the landscape proportion used by the current 900×600 vector representation. The declaration's translated length/width wording uses a different naming convention; no precise national construction sheet was found.

Added a Syria visual hook describing the stripe order and three red five-pointed stars. It is shown through the existing post-answer feedback lookup and does not affect question generation.

## Kyrgyzstan (`kg`) — corrected

Law No. 208 (22 December 2023) amended the state-symbol description. Cabinet Resolution No. 724 (29 December 2023) revised the flag technical specification: it changes the rays to straight rays, specifies forty rays with ten in each quarter, replaces the diagrams, and gives a 5:3 flag proportion. The revised technical-specification record also gives the red and yellow RGB values as 255/0/0 and 255/255/0, a radiant-disk/sun-disk diameter ratio of 5:3, and a tunduk diameter half that of the radiant disk. Sources: [Ministry of Justice record for Law No. 208](https://cbd.minjust.gov.kg/4-5235/edition/953/ru), [Resolution No. 724 and revised technical specification](https://prg.kz/document/?doc_id=37861395), [President of Kyrgyz Republic — state symbols](https://www.president.kg/ru/about/symbol), [current Wikimedia Commons flag and reuse status](https://commons.wikimedia.org/wiki/File:Flag_of_Kyrgyzstan.svg).

Replaced `public/flags/kg.svg` with a self-contained 1000×600 reconstruction using the revised proportion, red and yellow colours, forty evenly spaced straight rays, a centered sun, and the red tunduk within it. The tunduk is a simplified geometric ring and crossed-bar drawing, sized to half the radiant disk diameter; it preserves the identifiable central symbol without copying the Commons SVG source. The existing hook was updated to name the straight rays and crossed bars. It remains available from the same lookup.

## Honduras (`hn`) — preserve current shade

The Honduran Education Ministry describes the upper and lower bands as turquoise blue, while official publications and presentations have used differing digital blues. A September 2026 Honduran Congress notice reports a bill proposing “azul turquí” (dark blue), indicating a proposal rather than an established replacement specification. None of the reviewed official material establishes an exact hex or RGB value. Sources: [Honduran Education Ministry flag description](https://www.se.gob.hn/detalle-articulo/1470/), [Honduran Congress proposal](https://congresonacional.hn/noticias/6ab4834ef02476394afec7bc), [TSC 2024 observance](https://www.tsc.gob.hn/index.php/2024/09/01/en-acto-solemne-el-tsc-rindio-tributo-a-la-bandera-nacional-en-su-dia/).

Kept `public/flags/hn.svg` and its five-star hook unchanged. The existing `#0073cf` is a digital approximation; changing it without an authoritative digital standard would be arbitrary.

## Afghanistan (`af`) — owner choice pending

`public/flags/af.svg` is byte-for-byte unchanged. It represents the Islamic Republic-era tricolour and state emblem; no hook was added, and lookup continues to return `undefined`. The short owner-facing options and recommendation are in [M18F Afghanistan flag choice](M18F_AFGHANISTAN_FLAG_OWNER_DECISION.md).

## Provenance, coverage and offline support

The original 193 country assets remain attributed to `svg-country-flags` v1.2.10. The new Syria and Kyrgyzstan SVGs are identified separately in [`public/flags/ATTRIBUTION.txt`](../public/flags/ATTRIBUTION.txt), with source URLs, access date, basis for the geometric drawings, and rights notes. No third-party SVG source code was copied, no remote image dependency was added, and Honduras/Afghanistan were not modified.

The existing country map still points to `/flags/{id}.svg`. Vite Workbox precaches `**/*.{js,css,html,svg,png,ico}`, so replacement SVGs are picked up by the production precache; this is build coverage, not a runtime offline test. The global asset test checks all 195 canonical mappings, self-contained XML structure, and no missing or extra country assets. Targeted assertions cover Syria's stripes/stars, Kyrgyzstan's ratio/ray count/core colours, Honduras remaining valid, and Afghanistan's original SHA-256 digest. Memory tests cover hook IDs, sources, no duplicates, lookup fallback, and regional totals.

## Verification and remaining work

- `npm test`: passed, 191 tests; 191 passed, 0 failed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed; 149 modules transformed. Main JavaScript chunk is **599.07 kB** (173.56 kB gzip). Workbox generated the service worker with **212 precache entries (3,205.53 KiB)**.
- Production output contains `dist/flags/sy.svg` and `dist/flags/kg.svg`; each byte-matches its source SVG. Honduras and Afghanistan outputs also match their public assets. The generated service-worker manifest lists all four paths, including the corrected flags.
- `git diff --check`: passed. Git printed LF-to-CRLF conversion notices for edited files; no whitespace errors were reported.
- Build warnings: the existing Vite advisory for chunks above 500 kB and Browserslist's `caniuse-lite` data being eight months old. No asset-build or XML-structure failures.
- No browser preview, device, screen-reader, or actual offline runtime check was performed. The simplified Kyrgyzstan tunduk still needs visual comparison with the revised government construction plate.

- **P0:** none identified.
- **P1:** Syria's confirmed artwork mismatch is corrected; visual confirmation on actual browser/device sizes remains open.
- **P2:** Afghanistan representation requires an owner decision; Honduras has no authoritative digital colour value; Kyrgyzstan's simplified tunduk drawing should be visually compared with the revised government construction plate during manual asset QA.
- **Manual:** browser preview, keyboard/screen-reader, device and actual offline runtime checks were not performed in this milestone and remain open in the release checklist.
- **Recommended next milestone:** owner decision for Afghanistan plus manual visual/device/offline verification of the release build. Do not start M18G until the owner-directed work is scoped.
